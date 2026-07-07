// Firebase Mock Database & Auth Engine - DocGenius AI (firebase-mock.js)

const FirebaseMock = (() => {
  
  // LocalStorage Helpers
  const loadData = (key, defaultVal) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultVal;
    } catch (e) {
      console.warn("Storage access failed, using fallback database.", e);
      return defaultVal;
    }
  };

  const saveData = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn("Could not save to LocalStorage.", e);
    }
  };

  // Seed default admin and initial user data
  const defaultUsers = [
    {
      id: "u_admin",
      fullName: "System Admin",
      email: "admin@docgenius.com",
      phoneNumber: "+919999988888",
      passwordHash: "Admin@123",
      emailVerified: true,
      phoneVerified: true,
      createdAt: new Date().toISOString(),
      role: "admin",
      blocked: false
    }
  ];

  // Load collections
  let users = loadData('fb_doc_users', defaultUsers);
  let documents = loadData('fb_doc_documents', []);
  let brandKits = loadData('fb_doc_brandkits', {});
  let apiConfigurations = loadData('fb_doc_api_configs', {});
  
  // Track active user session
  let currentUser = loadData('fb_doc_current_user', null);
  let authStateListeners = [];

  const notifyAuthStateChanged = () => {
    authStateListeners.forEach(listener => listener(currentUser));
  };

  const checkPasswordStrength = (pass) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score; 
  };

  // REAL FIREBASE AUTH INTEGRATION BRIDGE
  let realAuth = null;

  const mapFirebaseUser = (fbUser) => {
    if (!fbUser) return null;
    return {
      id: fbUser.uid,
      fullName: fbUser.displayName || fbUser.email.split('@')[0],
      email: fbUser.email,
      phoneNumber: fbUser.phoneNumber || "",
      emailVerified: fbUser.emailVerified,
      phoneVerified: false,
      role: "user",
      photoURL: fbUser.photoURL || "",
      blocked: false
    };
  };

  const syncUserToLocalDatabase = (userObj) => {
    if (!userObj) return;
    const idx = users.findIndex(u => u.id === userObj.id);
    if (idx === -1) {
      users.push(userObj);
      saveData('fb_doc_users', users);
    }
  };

  const initRealFirebase = () => {
    const config = loadData('fb_doc_global_config', {});
    if (config.fbApiKey && config.fbAuthDomain && config.fbProjectId) {
      if (window.firebase) {
        try {
          const fbConfig = {
            apiKey: config.fbApiKey,
            authDomain: config.fbAuthDomain,
            projectId: config.fbProjectId,
            appId: config.fbAppId
          };
          
          const proceedInit = () => {
            window.firebase.initializeApp(fbConfig);
            realAuth = window.firebase.auth();
            console.log("Real Firebase initialized successfully!");
            
            // Connect state listener
            realAuth.onAuthStateChanged(fbUser => {
              if (fbUser) {
                currentUser = mapFirebaseUser(fbUser);
                syncUserToLocalDatabase(currentUser);
                saveData('fb_doc_current_user', currentUser);
              } else {
                currentUser = null;
                saveData('fb_doc_current_user', null);
              }
              notifyAuthStateChanged();
            });
          };

          if (window.firebase.apps.length) {
            window.firebase.app().delete().then(proceedInit).catch(e => {
              console.error("Error deleting old Firebase app:", e);
              proceedInit();
            });
          } else {
            proceedInit();
          }
        } catch(e) {
          console.error("Failed to initialize Firebase:", e);
        }
      }
    }
  };

  // Run on startup and retry if firebase script loads slowly
  let initRetryCount = 0;
  const tryInitFirebase = () => {
    initRealFirebase();
    if (!realAuth && initRetryCount < 10) {
      initRetryCount++;
      setTimeout(tryInitFirebase, 500);
    }
  };
  setTimeout(tryInitFirebase, 100);

  // AUTH MODULE
  const auth = {
    get currentUser() {
      return currentUser;
    },

    onAuthStateChanged(listener) {
      authStateListeners.push(listener);
      listener(currentUser);
      return () => {
        authStateListeners = authStateListeners.filter(l => l !== listener);
      };
    },

    signUp(fullName, email, phoneNumber, password) {
      if (!realAuth) initRealFirebase();
      if (realAuth) {
        return realAuth.createUserWithEmailAndPassword(email, password)
          .then(result => {
            return result.user.updateProfile({ displayName: fullName })
              .then(() => {
                currentUser = mapFirebaseUser(result.user);
                currentUser.phoneNumber = phoneNumber;
                syncUserToLocalDatabase(currentUser);
                saveData('fb_doc_current_user', currentUser);
                notifyAuthStateChanged();
                return currentUser;
              });
          });
      }

      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const emailLower = email.toLowerCase().trim();
          if (users.find(u => u.email.toLowerCase() === emailLower)) {
            return reject(new Error("An account with this email address already exists."));
          }
          if (password.length < 4) {
            return reject(new Error("Password should be at least 4 characters long."));
          }

          const newUser = {
            id: 'u_' + Math.random().toString(36).substr(2, 9),
            fullName,
            email: emailLower,
            phoneNumber,
            passwordHash: password,
            emailVerified: false,
            phoneVerified: false,
            createdAt: new Date().toISOString(),
            role: "user",
            blocked: false
          };

          users.push(newUser);
          saveData('fb_doc_users', users);
          resolve(newUser);
        }, 400);
      });
    },

    signIn(email, password) {
      if (!realAuth) initRealFirebase();
      if (realAuth) {
        return realAuth.signInWithEmailAndPassword(email, password)
          .then(result => {
            currentUser = mapFirebaseUser(result.user);
            syncUserToLocalDatabase(currentUser);
            saveData('fb_doc_current_user', currentUser);
            notifyAuthStateChanged();
            return currentUser;
          });
      }

      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const emailLower = email.toLowerCase().trim();
          const user = users.find(u => u.email.toLowerCase() === emailLower);
          
          if (!user || user.passwordHash !== password) {
            return reject(new Error("Invalid email or password combination."));
          }
          if (user.blocked) {
            return reject(new Error("This account has been blocked."));
          }

          currentUser = user;
          saveData('fb_doc_current_user', currentUser);
          notifyAuthStateChanged();
          resolve(user);
        }, 450);
      });
    },

    signInAsGuest() {
      currentUser = {
        id: "u_guest",
        fullName: "Guest User",
        email: "guest@docgenius.com",
        phoneNumber: "",
        emailVerified: false,
        phoneVerified: false,
        role: "guest",
        blocked: false
      };
      notifyAuthStateChanged();
      return Promise.resolve(currentUser);
    },

    signInWithGoogle() {
      if (!realAuth) initRealFirebase();
      if (realAuth) {
        const provider = new window.firebase.auth.GoogleAuthProvider();
        return realAuth.signInWithPopup(provider)
          .then(result => {
            currentUser = mapFirebaseUser(result.user);
            syncUserToLocalDatabase(currentUser);
            saveData('fb_doc_current_user', currentUser);
            notifyAuthStateChanged();
            return currentUser;
          });
      }

      currentUser = {
        id: "u_google",
        fullName: "Google User",
        email: "google.user@gmail.com",
        phoneNumber: "+91 9999988888",
        emailVerified: true,
        phoneVerified: false,
        role: "user",
        blocked: false
      };
      saveData('fb_doc_current_user', currentUser);
      notifyAuthStateChanged();
      return Promise.resolve(currentUser);
    },

    signInWithApple() {
      if (!realAuth) initRealFirebase();
      if (realAuth) {
        const provider = new window.firebase.auth.OAuthProvider('apple.com');
        return realAuth.signInWithPopup(provider)
          .then(result => {
            currentUser = mapFirebaseUser(result.user);
            syncUserToLocalDatabase(currentUser);
            saveData('fb_doc_current_user', currentUser);
            notifyAuthStateChanged();
            return currentUser;
          });
      }

      currentUser = {
        id: "u_apple",
        fullName: "Apple User",
        email: "apple.user@icloud.com",
        phoneNumber: "",
        emailVerified: true,
        phoneVerified: false,
        role: "user",
        blocked: false
      };
      saveData('fb_doc_current_user', currentUser);
      notifyAuthStateChanged();
      return Promise.resolve(currentUser);
    },

    signOut() {
      if (!realAuth) initRealFirebase();
      if (realAuth) {
        return realAuth.signOut().then(() => {
          currentUser = null;
          saveData('fb_doc_current_user', null);
          notifyAuthStateChanged();
        });
      }

      currentUser = null;
      saveData('fb_doc_current_user', null);
      notifyAuthStateChanged();
      return Promise.resolve();
    },

    reinitializeRealFirebase() {
      initRealFirebase();
    },

    sendPasswordResetEmail(email) {
      if (!realAuth) initRealFirebase();
      if (realAuth) {
        return realAuth.sendPasswordResetEmail(email);
      }
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
          if (!user) {
            return reject(new Error("We couldn't find a registered user with that email."));
          }
          resolve("OTP reset code sent!");
        }, 300);
      });
    },

    verifyOTP(code) {
      if (code === "123456" || code === "111111") {
        if (currentUser && currentUser.id !== "u_guest") {
          const idx = users.findIndex(u => u.id === currentUser.id);
          if (idx !== -1) {
            users[idx].emailVerified = true;
            users[idx].phoneVerified = true;
            saveData('fb_doc_users', users);
            currentUser = users[idx];
            saveData('fb_doc_current_user', currentUser);
            notifyAuthStateChanged();
          }
        }
        return Promise.resolve(true);
      }
      return Promise.reject(new Error("Invalid 6-digit OTP code."));
    },

    updateUserProfile(updates) {
      if (!currentUser || currentUser.id === "u_guest") return Promise.reject(new Error("No active user session"));
      
      const idx = users.findIndex(u => u.id === currentUser.id);
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...updates };
        saveData('fb_doc_users', users);
        currentUser = users[idx];
        saveData('fb_doc_current_user', currentUser);
        notifyAuthStateChanged();
        return Promise.resolve(currentUser);
      }
      return Promise.reject(new Error("User record not found"));
    },

    changePassword(oldPassword, newPassword) {
      if (!currentUser || currentUser.id === "u_guest") return Promise.reject(new Error("No active user session"));
      const idx = users.findIndex(u => u.id === currentUser.id);
      if (idx !== -1) {
        if (users[idx].passwordHash !== oldPassword) {
          return Promise.reject(new Error("Current password is incorrect."));
        }
        users[idx].passwordHash = newPassword;
        saveData('fb_doc_users', users);
        return Promise.resolve();
      }
      return Promise.reject(new Error("User not found"));
    },

    deleteAccount() {
      if (!currentUser || currentUser.id === "u_guest") return Promise.reject(new Error("No active user session"));
      const targetId = currentUser.id;
      
      // Delete documents and brand kit relating to user
      documents = documents.filter(doc => doc.userId !== targetId);
      delete brandKits[targetId];
      delete apiConfigurations[targetId];
      saveData('fb_doc_documents', documents);
      saveData('fb_doc_brandkits', brandKits);
      saveData('fb_doc_api_configs', apiConfigurations);
      
      // Delete user account
      users = users.filter(u => u.id !== targetId);
      saveData('fb_doc_users', users);
      currentUser = null;
      saveData('fb_doc_current_user', null);
      notifyAuthStateChanged();
      return Promise.resolve();
    }
  };

  // FIRESTORE SIMULATOR DB MODULE
  const db = {
    documents: {
      get() {
        const userId = currentUser ? currentUser.id : "u_guest";
        const userDocs = documents.filter(doc => doc.userId === userId);
        return Promise.resolve(userDocs);
      },
      
      getById(id) {
        const doc = documents.find(d => d.id === id);
        return Promise.resolve(doc || null);
      },

      add(title, category, type, content) {
        const userId = currentUser ? currentUser.id : "u_guest";
        const timestamp = new Date().toISOString();
        
        const newDoc = {
          id: 'doc_' + Math.random().toString(36).substr(2, 9),
          userId,
          title,
          category,
          type,
          content,
          createdAt: timestamp,
          updatedAt: timestamp,
          versions: [
            {
              versionId: 'v1',
              content: content,
              timestamp: timestamp,
              title: "Initial Generation"
            }
          ]
        };

        documents.push(newDoc);
        saveData('fb_doc_documents', documents);
        return Promise.resolve(newDoc);
      },

      update(id, content, versionTitle = "Modified Draft") {
        const docIdx = documents.findIndex(d => d.id === id);
        if (docIdx === -1) return Promise.reject(new Error("Document not found"));
        
        const timestamp = new Date().toISOString();
        const doc = documents[docIdx];
        
        // Generate new version id
        const nextVerNum = doc.versions.length + 1;
        const versionId = 'v' + nextVerNum;
        
        doc.content = content;
        doc.updatedAt = timestamp;
        doc.versions.push({
          versionId,
          content,
          timestamp,
          title: versionTitle
        });
        
        saveData('fb_doc_documents', documents);
        return Promise.resolve(doc);
      },

      rollback(id, versionId) {
        const docIdx = documents.findIndex(d => d.id === id);
        if (docIdx === -1) return Promise.reject(new Error("Document not found"));
        
        const doc = documents[docIdx];
        const ver = doc.versions.find(v => v.versionId === versionId);
        if (!ver) return Promise.reject(new Error("Version not found"));
        
        const timestamp = new Date().toISOString();
        const nextVerNum = doc.versions.length + 1;
        const newVerId = 'v' + nextVerNum;
        
        doc.content = ver.content;
        doc.updatedAt = timestamp;
        doc.versions.push({
          versionId: newVerId,
          content: ver.content,
          timestamp,
          title: `Rolled back to ${versionId}`
        });

        saveData('fb_doc_documents', documents);
        return Promise.resolve(doc);
      },

      delete(id) {
        documents = documents.filter(d => d.id !== id);
        saveData('fb_doc_documents', documents);
        return Promise.resolve(true);
      }
    },

    brandKit: {
      get() {
        const userId = currentUser ? currentUser.id : "u_guest";
        const kit = brandKits[userId] || {
          companyName: "",
          tagline: "",
          email: "",
          phone: "",
          address: "",
          taxNumber: "",
          primaryColor: "#bb86fc",
          logoBase64: ""
        };
        return Promise.resolve(kit);
      },

      save(brandData) {
        const userId = currentUser ? currentUser.id : "u_guest";
        brandKits[userId] = brandData;
        saveData('fb_doc_brandkits', brandKits);
        return Promise.resolve(brandData);
      }
    },

    apiConfig: {
      get() {
        const config = loadData('fb_doc_global_config', {
          apiKey: "",
          model: "gemini-2.5-flash",
          soundEnabled: true,
          smtpUser: "",
          smtpPass: "",
          smtpHost: "smtp.gmail.com",
          smtpPort: "587",
          fbApiKey: "",
          fbAuthDomain: "",
          fbProjectId: "",
          fbAppId: ""
        });
        return Promise.resolve(config);
      },

      save(configData) {
        saveData('fb_doc_global_config', configData);
        return Promise.resolve(configData);
      }
    }
  };

  // Seed default demo documents if registry is completely empty
  const seedDemoDocsIfEmpty = () => {
    const userId = currentUser ? currentUser.id : "u_guest";
    const userDocs = documents.filter(doc => doc.userId === userId);
    
    if (userDocs.length === 0 && window.DocumentDB && window.DocumentDB.demoDocuments) {
      window.DocumentDB.demoDocuments.forEach(demo => {
        const timestamp = new Date().toISOString();
        documents.push({
          id: demo.id + '_' + userId,
          userId,
          title: demo.title,
          category: demo.category,
          type: demo.type,
          content: demo.content,
          createdAt: timestamp,
          updatedAt: timestamp,
          versions: demo.versions.map(v => ({
            versionId: v.versionId,
            content: v.content,
            timestamp: timestamp,
            title: "Demo Template"
          }))
        });
      });
      saveData('fb_doc_documents', documents);
    }
  };

  // Listen to auth changes to seed demos
  auth.onAuthStateChanged((user) => {
    if (user) {
      seedDemoDocsIfEmpty();
    }
  });

  return {
    auth,
    db,
    checkPasswordStrength
  };
})();

// Assign globally
window.FirebaseMock = FirebaseMock;
