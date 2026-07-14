// DocGenius AI - Document Templates Database (db.js)

const DocumentDB = {
  // Document configurations categorized
  categories: {
    business: {
      label: "💼 Business",
      types: {
        invoice: {
          label: "GST Invoice",
          description: "Professional tax bill structure with dynamic calculation tables",
          fields: [
            { id: "invoiceNumber", label: "Invoice Number", type: "text", placeholder: "e.g. DG-2026-001", default: "DG-2026-001" },
            { id: "invoiceDate", label: "Invoice Date", type: "date", default: new Date().toISOString().split('T')[0] },
            { id: "clientName", label: "Client Name", type: "text", placeholder: "e.g. Acme Tech Solutions Ltd", default: "Acme Tech Solutions Ltd" },
            { id: "clientAddress", label: "Client Address", type: "text", placeholder: "e.g. MG Road, Bangalore", default: "MG Road, Bangalore" },
            { id: "clientGST", label: "Client GSTIN", type: "text", placeholder: "e.g. 29BBBBB1111B2Z2", default: "29BBBBB1111B2Z2" },
            { id: "billingItems", label: "Billing Items (Item,Qty,Price;...)", type: "textarea", placeholder: "e.g. Web Development Service,1,45000;Consulting Fee,5,2500", default: "Web Development Service,1,45000;API Integration Service,1,12000" },
            { id: "taxRate", label: "GST Rate (%)", type: "number", placeholder: "18", default: "18" },
            { id: "discount", label: "Discount Amount (₹)", type: "number", placeholder: "e.g. 2000", default: "1500" }
          ]
        },
        proposal: {
          label: "Business Proposal",
          description: "Detailed pitch document outlining project details and quotes",
          fields: [
            { id: "proposalTitle", label: "Proposal Title", type: "text", placeholder: "e.g. Custom ERP Sourcing & Deployment", default: "Custom ERP Sourcing & Deployment" },
            { id: "targetClient", label: "Client / Organization Name", type: "text", placeholder: "e.g. Global Retail Chain Corp", default: "Global Retail Chain Corp" },
            { id: "projectScope", label: "Project Scope & Description", type: "textarea", placeholder: "e.g. Developing cloud-based inventory module...", default: "Developing a custom cloud-based ERP application to automate inventory management across 5 regional warehouses, integrated with a secure dashboard." },
            { id: "timeline", label: "Project Timeline (weeks)", type: "number", placeholder: "e.g. 12", default: "12" },
            { id: "projectCost", label: "Estimated Project Budget (₹)", type: "number", placeholder: "e.g. 450000", default: "450000" }
          ]
        },
        quotation: {
          label: "Sales Quotation",
          description: "A pricing quotation specifying details, pricing, and validity parameters",
          fields: [
            { id: "quoteNumber", label: "Quotation Number", type: "text", placeholder: "e.g. QTE-2026-88", default: "QTE-2026-88" },
            { id: "validityDays", label: "Validity Period (days)", type: "number", placeholder: "e.g. 30", default: "30" },
            { id: "clientContact", label: "Client Contact Person", type: "text", placeholder: "e.g. Mrs. Priya Sharma", default: "Mrs. Priya Sharma" },
            { id: "itemsList", label: "Items (Item Name, Price;...)", type: "textarea", placeholder: "e.g. Laptop Stand,1200;Office Chair,8500", default: "Premium Office Ergonomic Chair,8500;Adjustable Steel Desk,18000" }
          ]
        },
        meeting_minutes: {
          label: "Meeting Minutes",
          description: "Comprehensive record of discussions, attendees, and actionable tasks",
          fields: [
            { id: "meetingTitle", label: "Meeting Subject", type: "text", placeholder: "e.g. Q3 Sales Strategy Sync", default: "Q3 Sales Strategy Sync" },
            { id: "meetingDate", label: "Date & Time", type: "text", placeholder: "July 7, 2026 at 10:00 AM", default: "July 7, 2026 at 10:00 AM" },
            { id: "attendees", label: "Attendees (comma separated)", type: "text", placeholder: "Rohan, Neha, Priya, Amit", default: "Rohan Das, Neha Sen, Priya Sharma, Amit Varma" },
            { id: "discussionPoints", label: "Main Points Discussed", type: "textarea", placeholder: "e.g. Budget reviews, Lead generation targets...", default: "Reviewed quarterly lead acquisition stats; identified a bottle-neck in client onboarding onboarding; proposed training session; approved budget for additional marketing outreach." }
          ]
        },
        contracts: {
          label: "Agreement Contract",
          description: "Basic contract outlining terms and conditions between two parties",
          fields: [
            { id: "partyA", label: "First Party Name", type: "text", placeholder: "e.g. DocGenius Tech Ventures", default: "DocGenius Tech Ventures" },
            { id: "partyB", label: "Second Party Name", type: "text", placeholder: "e.g. Rohan Enterprises Ltd", default: "Rohan Das Enterprises" },
            { id: "agreementDate", label: "Agreement Effective Date", type: "date", default: new Date().toISOString().split('T')[0] },
            { id: "paymentTerms", label: "Payment terms / Deliverables", type: "textarea", placeholder: "e.g. 50% advance, 50% upon successful delivery", default: "50% upfront retainer, 50% upon completion of milestone achievements as verified by both parties within 30 days." }
          ]
        },
        offer_letter: {
          label: "Offer Letter",
          description: "Official job offer specifying salary, details, and role specifications",
          fields: [
            { id: "candidateName", label: "Candidate Name", type: "text", placeholder: "e.g. Amit Kumar", default: "Amit Kumar" },
            { id: "jobTitle", label: "Job Title", type: "text", placeholder: "e.g. Associate Software Engineer", default: "Associate Software Engineer" },
            { id: "startDate", label: "Joining Date", type: "date", default: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
            { id: "salary", label: "Annual Package (CTC in ₹)", type: "number", placeholder: "e.g. 800000", default: "800000" }
          ]
        },
        leave_approval: {
          label: "Leave Approval",
          description: "Leave authorization letter from manager to employee",
          fields: [
            { id: "employeeName", label: "Employee Name", type: "text", placeholder: "e.g. Sneha Patel", default: "Sneha Patel" },
            { id: "leaveStart", label: "Leave Start Date", type: "date", default: new Date().toISOString().split('T')[0] },
            { id: "leaveEnd", label: "Leave End Date", type: "date", default: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
            { id: "leaveReason", label: "Reason for Leave", type: "text", placeholder: "e.g. Medical emergency / Personal reasons", default: "Annual family reunion travel" }
          ]
        },
        menu_card: {
          label: "Traditional Menu Card",
          description: "A beautifully styled, traditional, double-bordered restaurant menu template",
          fields: [
            { id: "restaurantName", label: "Restaurant Name", type: "text", placeholder: "e.g. DEEPIKA Pickles", default: "DEEPIKA Pickles" },
            { id: "tagline", label: "Tagline", type: "text", placeholder: "e.g. Experience the Magic of Homemade Pickles", default: "Experience the Magic of Homemade Pickles" },
            { id: "contactPhone", label: "Contact Phone", type: "text", placeholder: "e.g. +91 9652286824", default: "+91 9652286824" },
            { id: "contactEmail", label: "Contact Email", type: "text", placeholder: "e.g. deepikapickles26@gmail.com", default: "deepikapickles26@gmail.com" },
            { id: "vegItems", label: "Veg Items (Name,Price;...)", type: "textarea", placeholder: "e.g. Mango (Avakaya) / మామిడికాయ (ఆవకాయ),650;Tomato / టమాటో,600", default: "Mango (Avakaya) / మామిడికాయ (ఆవకాయ),650;Tomato / టమాటో,600;Gongura / గోంగూర,600;Pudina (Mint) / పుదీనా,600;Gooseberry / ఉసిరికాయ,600;Mixed Vegetable / మిశ్రమ కూరగాయలు,600;Red Chili / పండు మిరపకాయ,600;Gongura Red Chili / గోంగూర పండు మిరపకాయ,600;Drumstick / ములక్కాయ,600;Lemon / నిమ్మకాయ,600;Brinjal (Eggplant) / వంకాయ,600;Ginger / అల్లం,600" },
            { id: "nonVegItems", label: "Non-Veg Items (Name,Price;...)", type: "textarea", placeholder: "e.g. Chicken Bone / చికెన్,900;Chicken Boneless / చికెన్ ఎముకలు లేనిది,1200", default: "Chicken Bone / చికెన్,900;Chicken Boneless / చికెన్ ఎముకలు లేనిది,1200;Mutton Bone / మటన్,1500;Mutton Boneless / మటన్ ఎముకలు లేనిది,1800;Fish Boneless / చేప ఎముకలు లేనిది,1600;Fish Bone / చేప,1200;Prawns / రొయ్యలు,1600" }
          ]
        }
      }
    },
    education: {
      label: "🎓 Education",
      types: {
        question_paper: {
          label: "Question Paper",
          description: "Formulate school or university level examinations",
          fields: [
            { id: "subject", label: "Subject", type: "text", placeholder: "e.g. Science / Computer Science", default: "Computer Science" },
            { id: "grade", label: "Grade / Class", type: "text", placeholder: "e.g. Class 10 / B.Tech Sem 3", default: "Class 10" },
            { id: "examName", label: "Examination Title", type: "text", placeholder: "e.g. Term 1 Final Examination", default: "Term 1 Mid-Term Examination" },
            { id: "chapters", label: "Topics / Syllabus Chapters", type: "textarea", placeholder: "e.g. Chapter 1: Introduction to Networks, Chapter 2: HTML", default: "Chapter 1: Basics of HTML & Web Design, Chapter 2: Introduction to CSS Stylesheets" },
            { id: "totalMarks", label: "Total Marks", type: "number", placeholder: "100", default: "50" }
          ]
        },
        assignment: {
          label: "Assignment",
          description: "Student assignment worksheets with guidelines and due dates",
          fields: [
            { id: "assignmentSubject", label: "Subject / Course", type: "text", placeholder: "e.g. History / physics", default: "Physics" },
            { id: "assignmentTitle", label: "Assignment Title", type: "text", placeholder: "e.g. Kepler's Laws Simulation", default: "Newtonian Mechanics & Kepler's Laws" },
            { id: "dueDate", label: "Due Date", type: "date", default: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
            { id: "guidelines", label: "Specific Project Guidelines", type: "textarea", placeholder: "e.g. 500 words, cite 3 resources...", default: "Prepare a detailed numerical report verifying Kepler's Third Law using planetary periods. Must include diagrams and cite at least 2 scientific references." }
          ]
        },
        answer_key: {
          label: "Answer Key",
          description: "Accompanying solutions and grading rubric for tests",
          fields: [
            { id: "keySubject", label: "Subject", type: "text", placeholder: "e.g. Chemistry", default: "Chemistry" },
            { id: "testTitle", label: "Corresponding Exam Title", type: "text", placeholder: "e.g. Midterm Quiz 1 Solutions", default: "Organic Chemistry Midterm Quiz" },
            { id: "questionsCount", label: "Number of Questions", type: "number", placeholder: "5", default: "4" }
          ]
        },
        certificate: {
          label: "Certificate of Merit",
          description: "Academic or professional certificate of completion",
          fields: [
            { id: "recipientName", label: "Recipient Name", type: "text", placeholder: "e.g. Rohan Das", default: "Rohan Das" },
            { id: "courseName", label: "Achievement / Course Title", type: "text", placeholder: "e.g. Advanced AI Prompt Engineering", default: "Advanced Web Development Bootcamp" },
            { id: "issueDate", label: "Issue Date", type: "date", default: new Date().toISOString().split('T')[0] },
            { id: "issuerName", label: "Issuing Authority / Institution Name", type: "text", placeholder: "e.g. DocGenius Academy", default: "DocGenius Academy of Tech Sciences" }
          ]
        }
      }
    },
    personal: {
      label: "👤 Personal",
      types: {
        resume: {
          label: "Professional Resume",
          description: "A tailored resume layout with contact info, skills, and summary",
          fields: [
            { id: "fullName", label: "Full Name", type: "text", placeholder: "e.g. Ramesh Kumar", default: "Ramesh Kumar" },
            { id: "email", label: "Email Address", type: "text", placeholder: "ramesh@email.com", default: "ramesh@email.com" },
            { id: "phone", label: "Phone Number", type: "text", placeholder: "+91 9988776655", default: "+91 9988776655" },
            { id: "targetRole", label: "Target Job Designation", type: "text", placeholder: "e.g. Senior Frontend Developer", default: "Senior UI/UX Engineer" },
            { id: "experienceYears", label: "Years of Experience", type: "number", placeholder: "5", default: "4" },
            { id: "coreSkills", label: "Skills (comma separated)", type: "text", placeholder: "React, CSS, Figma, Agile", default: "HTML5, CSS3, JavaScript, React.js, Figma, User Research, Git" }
          ]
        },
        cover_letter: {
          label: "Cover Letter",
          description: "Letter pitch tailored to target companies and roles",
          fields: [
            { id: "applicantName", label: "Applicant Name", type: "text", placeholder: "e.g. Amit Varma", default: "Amit Varma" },
            { id: "targetCompany", label: "Target Company Name", type: "text", placeholder: "e.g. Google India", default: "Google India" },
            { id: "targetJob", label: "Target Job Title", type: "text", placeholder: "e.g. Software Consultant", default: "Software Consultant" },
            { id: "highlightAchievement", label: "Key Achievement / Experience", type: "textarea", placeholder: "e.g. Built a custom billing solution that saved 30% time...", default: "Designed and engineered an automated invoice generation pipeline utilizing local storage states, reducing processing overhead by 40%." }
          ]
        }
      }
    }
  },

  // Seed/Demo Documents to preload on first load
  demoDocuments: [
    {
      id: "doc_demo_1",
      title: "Invoice #DG-2026-001 - Acme Tech",
      category: "business",
      type: "invoice",
      content: `<h1>INVOICE</h1>
<p><strong>Invoice Number:</strong> DG-2026-001<br><strong>Date:</strong> 2026-07-07</p>

<h3>Billed To:</h3>
<p>Acme Tech Solutions Ltd<br>MG Road, Bangalore<br>GSTIN: 29BBBBB1111B2Z2</p>

<table>
  <thead>
    <tr>
      <th>Description</th>
      <th style="text-align: center;">Quantity</th>
      <th style="text-align: right;">Unit Price (₹)</th>
      <th style="text-align: right;">Total Price (₹)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Web Development Service</td>
      <td style="text-align: center;">1</td>
      <td style="text-align: right;">45000.00</td>
      <td style="text-align: right;">45000.00</td>
    </tr>
    <tr>
      <td>API Integration Service</td>
      <td style="text-align: center;">1</td>
      <td style="text-align: right;">12000.00</td>
      <td style="text-align: right;">12000.00</td>
    </tr>
    <tr>
      <td colspan="3" style="text-align: right; font-weight: bold;">Subtotal</td>
      <td style="text-align: right; font-weight: bold;">57000.00</td>
    </tr>
    <tr>
      <td colspan="3" style="text-align: right; font-weight: bold;">Discount</td>
      <td style="text-align: right; font-weight: bold;">- 1500.00</td>
    </tr>
    <tr>
      <td colspan="3" style="text-align: right; font-weight: bold;">GST (18%)</td>
      <td style="text-align: right; font-weight: bold;">9990.00</td>
    </tr>
    <tr style="background-color: #f8fafc;">
      <td colspan="3" style="text-align: right; font-weight: bold; color: #1e1b4b;">Total Payable</td>
      <td style="text-align: right; font-weight: bold; color: #1e1b4b;">65490.00</td>
    </tr>
  </tbody>
</table>

<p><strong>Terms:</strong> Payment due within 15 days of invoice date. Thank you for your business!</p>`,
      createdAt: "2026-07-07T09:55:00Z",
      updatedAt: "2026-07-07T09:55:00Z",
      versions: [
        {
          versionId: "v1",
          content: `<h1>INVOICE</h1>
<p><strong>Invoice Number:</strong> DG-2026-001<br><strong>Date:</strong> 2026-07-07</p>

<h3>Billed To:</h3>
<p>Acme Tech Solutions Ltd<br>MG Road, Bangalore<br>GSTIN: 29BBBBB1111B2Z2</p>

<table>
  <thead>
    <tr>
      <th>Description</th>
      <th style="text-align: center;">Quantity</th>
      <th style="text-align: right;">Unit Price (₹)</th>
      <th style="text-align: right;">Total Price (₹)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Web Development Service</td>
      <td style="text-align: center;">1</td>
      <td style="text-align: right;">45000.00</td>
      <td style="text-align: right;">45000.00</td>
    </tr>
    <tr>
      <td>API Integration Service</td>
      <td style="text-align: center;">1</td>
      <td style="text-align: right;">12000.00</td>
      <td style="text-align: right;">12000.00</td>
    </tr>
    <tr>
      <td colspan="3" style="text-align: right; font-weight: bold;">Subtotal</td>
      <td style="text-align: right; font-weight: bold;">57000.00</td>
    </tr>
    <tr>
      <td colspan="3" style="text-align: right; font-weight: bold;">Discount</td>
      <td style="text-align: right; font-weight: bold;">- 1500.00</td>
    </tr>
    <tr>
      <td colspan="3" style="text-align: right; font-weight: bold;">GST (18%)</td>
      <td style="text-align: right; font-weight: bold;">9990.00</td>
    </tr>
    <tr style="background-color: #f8fafc;">
      <td colspan="3" style="text-align: right; font-weight: bold; color: #1e1b4b;">Total Payable</td>
      <td style="text-align: right; font-weight: bold; color: #1e1b4b;">65490.00</td>
    </tr>
  </tbody>
</table>

<p><strong>Terms:</strong> Payment due within 15 days of invoice date. Thank you for your business!</p>`,
          timestamp: "2026-07-07T09:55:00Z"
        }
      ]
    },
    {
      id: "doc_demo_2",
      title: "Newtonian Mechanics Assignment",
      category: "education",
      type: "assignment",
      content: `<h1>Physics Assignment: Newtonian Mechanics & Kepler's Laws</h1>
<p><strong>Due Date:</strong> 2026-07-17<br><strong>Course Code:</strong> PHY-101</p>

<h2>Assignment Guidelines:</h2>
<p>Students must prepare a detailed numerical report verifying Kepler's Third Law using planetary periods. Must include diagrams and cite at least 2 scientific references.</p>

<h2>Questions for Submission:</h2>
<ol>
  <li><strong>State Kepler's Three Laws of Planetary Motion:</strong> Provide the mathematical formulation of the Harmonic Law (Third Law) and explain how it relates planetary orbital periods to their semi-major axes.</li>
  <li><strong>Numerical Analysis:</strong> Given the semi-major axis of Jupiter's orbit as \(a = 5.203 \text{ AU}\), compute its orbital period in Earth years. Show all calculation steps, starting with \(T^2 = k a^3\).</li>
  <li><strong>Application Scenario:</strong> An astronomer discovers an exoplanet orbiting a sun-like star with a period of 8 Earth years. Predict the distance of this exoplanet from its host star in Astronomical Units (AU).</li>
</ol>

<h2>Grading Rubric:</h2>
<ul>
  <li>Completeness and accuracy of derivations: <strong>40%</strong></li>
  <li>Numerical calculations step-by-step: <strong>40%</strong></li>
  <li>Resource citations and formatting excellence: <strong>20%</strong></li>
</ul>`,
      createdAt: "2026-07-07T09:56:00Z",
      updatedAt: "2026-07-07T09:56:00Z",
      versions: [
        {
          versionId: "v1",
          content: `<h1>Physics Assignment: Newtonian Mechanics & Kepler's Laws</h1>
<p><strong>Due Date:</strong> 2026-07-17<br><strong>Course Code:</strong> PHY-101</p>
<h2>Assignment Guidelines:</h2>
<p>Students must prepare a detailed numerical report verifying Kepler's Third Law using planetary periods. Must include diagrams and cite at least 2 scientific references.</p>`,
          timestamp: "2026-07-07T09:56:00Z"
        }
      ]
    }
  ],

  // System Prompt Builder for Gemini API Calls
  buildGeminiPrompt(category, type, variables, promptContext, tone, language, brandInfo, useBranding) {
    let brandStatement = "";
    if (useBranding && brandInfo) {
      brandStatement = `This document is branded for ${brandInfo.companyName} (${brandInfo.tagline || ''}). In the body, do not re-add the company header logo area because the system UI automatically displays it at the top, but you can incorporate company context naturally.`;
    }

    return `
You are DocGenius AI, a state-of-the-art document generation system.
Generate a structured, professional, ready-to-use document in HTML format based on the following instructions:

Document Category: ${category}
Document Type: ${type}
Target Language: ${language} (Generate the complete text in this language. If you need to translate terms, translate them properly)
Tone of Voice: ${tone} (Adjust word choice and sentence length to match this tone)
${brandStatement}

Variables Provided by User:
${Object.entries(variables).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

Additional Context/Instructions from User:
"${promptContext || 'No additional instructions provided.'}"

Critical Formatting Rules:
1. Output ONLY valid HTML code. Do NOT enclose your output in markdown formatting block quotes (e.g., do NOT start with \`\`\`html and do NOT end with \`\`\`).
2. Do NOT output <html>, <head>, or <body> tags. Output only the inner HTML structure starting from heading tags (e.g. <h1>, <h2>) or paragraphs.
3. If it is an Invoice or Quotation, you MUST output a beautifully styled HTML table showing item details, quantities, prices, calculations, and subtotals. Clean, clean tables. Add inline styling to headers like padding.
4. Do NOT output placeholders. Provide realistic generated text.
5. Use appropriate HTML elements (e.g., <ol>, <ul>, <li>, <strong>, <br>).
6. Ensure formatting is clean, aligned, and professional.
`;
  },

  // Static Offline Mock Generation templates when Gemini API key is missing
  generateOfflineMockDoc(category, type, variables, promptContext, tone, language, brandInfo, useBranding) {
    const brandName = (useBranding && brandInfo) ? brandInfo.companyName : "Generic Corp";
    const brandAddress = (useBranding && brandInfo) ? brandInfo.address : "";
    const brandTax = (useBranding && brandInfo) ? brandInfo.taxNumber : "";

    switch (type) {
      case "invoice": {
        const invNum = variables.invoiceNumber || "DG-2026-X";
        const client = variables.clientName || "Valued Client";
        const clientAdd = variables.clientAddress || "";
        const clientGst = variables.clientGST || "N/A";
        const taxRate = parseFloat(variables.taxRate || "18") / 100;
        const discount = parseFloat(variables.discount || "0");
        
        let subtotal = 0;
        let itemsHtml = "";
        
        try {
          const itemsStr = variables.billingItems || "Service,1,1000";
          const itemsArr = itemsStr.split(';');
          itemsArr.forEach(i => {
            const parts = i.split(',');
            if (parts.length >= 3) {
              const name = parts[0].trim();
              const qty = parseInt(parts[1]) || 1;
              const price = parseFloat(parts[2]) || 0;
              const tot = qty * price;
              subtotal += tot;
              itemsHtml += `<tr>
                <td>${name}</td>
                <td style="text-align: center;">${qty}</td>
                <td style="text-align: right;">${price.toFixed(2)}</td>
                <td style="text-align: right;">${tot.toFixed(2)}</td>
              </tr>`;
            }
          });
        } catch (e) {
          itemsHtml = `<tr><td>General Consultancy Service</td><td style="text-align: center;">1</td><td style="text-align: right;">10000.00</td><td style="text-align: right;">10000.00</td></tr>`;
          subtotal = 10000;
        }

        const discounted = subtotal - discount;
        const taxAmt = discounted * taxRate;
        const total = discounted + taxAmt;

        return `<h1>TAX INVOICE</h1>
<p><strong>Invoice Number:</strong> ${invNum}<br><strong>Date:</strong> ${variables.invoiceDate || new Date().toISOString().split('T')[0]}</p>

<h3>Billed To:</h3>
<p>${client}<br>${clientAdd}<br>GSTIN: ${clientGst}</p>

<table>
  <thead>
    <tr>
      <th>Description</th>
      <th style="text-align: center;">Quantity</th>
      <th style="text-align: right;">Unit Price (₹)</th>
      <th style="text-align: right;">Total Price (₹)</th>
    </tr>
  </thead>
  <tbody>
    ${itemsHtml}
    <tr>
      <td colspan="3" style="text-align: right; font-weight: bold;">Subtotal</td>
      <td style="text-align: right; font-weight: bold;">${subtotal.toFixed(2)}</td>
    </tr>
    ${discount > 0 ? `<tr>
      <td colspan="3" style="text-align: right; font-weight: bold;">Discount</td>
      <td style="text-align: right; font-weight: bold;">- ${discount.toFixed(2)}</td>
    </tr>` : ""}
    <tr>
      <td colspan="3" style="text-align: right; font-weight: bold;">GST (${variables.taxRate || '18'}%)</td>
      <td style="text-align: right; font-weight: bold;">${taxAmt.toFixed(2)}</td>
    </tr>
    <tr style="background-color: #f8fafc;">
      <td colspan="3" style="text-align: right; font-weight: bold; color: #1e1b4b;">Total Payable</td>
      <td style="text-align: right; font-weight: bold; color: #1e1b4b;">${total.toFixed(2)}</td>
    </tr>
  </tbody>
</table>

<p><strong>Terms:</strong> Payment due within 15 days of invoice date. Thank you for your trust in ${brandName}.</p>
<p style="font-size: 11px; font-style: italic; color: #777;">Additional Context applied: "${promptContext || 'None'}" (Generated in ${tone} tone, language: ${language}).</p>`;
      }
      
      case "proposal": {
        const title = variables.proposalTitle || "Project Proposal";
        const client = variables.targetClient || "Prospective Client";
        const scope = variables.projectScope || "General services to be provided.";
        const timeline = variables.timeline || "6";
        const cost = parseFloat(variables.projectCost || "50000").toLocaleString('en-IN');

        return `<h1>Business Proposal: ${title}</h1>
<p><strong>Prepared By:</strong> ${brandName}<br><strong>Prepared For:</strong> ${client}<br><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>

<h2>1. Executive Summary</h2>
<p>This proposal outlines the strategy, terms, and cost projections prepared by ${brandName} to deploy the "${title}" project for ${client}. Our objective is to deliver a highly optimized, efficient, and robust solution tailored to your operational requirements.</p>

<h2>2. Project Scope & Deliverables</h2>
<p>${scope}</p>

<h2>3. Estimated Timeline & Schedule</h2>
<p>The total duration of the project is estimated to be <strong>${timeline} weeks</strong> from the sign-off date. Work will be split into the following milestones:</p>
<ul>
  <li><strong>Weeks 1-3:</strong> Requirement mapping and wireframes blueprinting.</li>
  <li><strong>Weeks 4-8:</strong> Development sprint iteration cycles.</li>
  <li><strong>Weeks 9-11:</strong> Integration, testing, and pilot deployments.</li>
  <li><strong>Week 12:</strong> Final handover and training.</li>
</ul>

<h2>4. Budget & Financial Proposal</h2>
<p>The total estimated budget for the designated scope of deliverables is <strong>₹${cost}</strong>. This budget is inclusive of implementation, testing, and deployment setup fees.</p>

<p>We look forward to collaborating on this project. Please reach out with any clarification requests.</p>
<p style="font-size: 11px; font-style: italic; color: #777;">Additional Context: "${promptContext || 'None'}" (Generated in ${tone} tone, language: ${language}).</p>`;
      }
      
      case "quotation": {
        const quoteNum = variables.quoteNumber || "QTE-2026-X";
        const clientContact = variables.clientContact || "Client Representative";
        const validity = variables.validityDays || "30";
        
        let subtotal = 0;
        let itemsHtml = "";
        
        try {
          const itemsStr = variables.itemsList || "Item,1000";
          const itemsArr = itemsStr.split(';');
          itemsArr.forEach(i => {
            const parts = i.split(',');
            if (parts.length >= 2) {
              const name = parts[0].trim();
              const price = parseFloat(parts[1]) || 0;
              subtotal += price;
              itemsHtml += `<tr>
                <td>${name}</td>
                <td style="text-align: right;">${price.toFixed(2)}</td>
              </tr>`;
            }
          });
        } catch (e) {
          itemsHtml = `<tr><td>Office Equipment Item</td><td style="text-align: right;">10000.00</td></tr>`;
          subtotal = 10000;
        }

        return `<h1>SALES QUOTATION</h1>
<p><strong>Quotation Number:</strong> ${quoteNum}<br><strong>Date:</strong> ${new Date().toISOString().split('T')[0]}<br><strong>Validity:</strong> ${validity} Days</p>

<h3>Prepared For:</h3>
<p>${clientContact}</p>

<table>
  <thead>
    <tr>
      <th>Product / Service Description</th>
      <th style="text-align: right;">Unit Price (₹)</th>
    </tr>
  </thead>
  <tbody>
    ${itemsHtml}
    <tr style="background-color: #f8fafc; font-weight: bold;">
      <td style="text-align: right;">Total Estimated Amount</td>
      <td style="text-align: right;">${subtotal.toFixed(2)}</td>
    </tr>
  </tbody>
</table>

<p><strong>Terms & Conditions:</strong> Prices are valid for ${validity} days. Delivery schedule to be negotiated upon order confirmation.</p>
<p style="font-size: 11px; font-style: italic; color: #777;">Additional Context: "${promptContext || 'None'}" (Generated in ${tone} tone, language: ${language}).</p>`;
      }

      case "meeting_minutes": {
        const title = variables.meetingTitle || "General Meeting";
        const date = variables.meetingDate || "July 7, 2026";
        const att = variables.attendees || "Attendees";
        const points = variables.discussionPoints || "No details provided.";

        return `<h1>Meeting Minutes: ${title}</h1>
<p><strong>Date/Time:</strong> ${date}<br><strong>Facilitator:</strong> ${brandName}</p>

<h3>Attendees:</h3>
<p>${att}</p>

<h3>Meeting Agenda & Main Discussions:</h3>
<p>${points}</p>

<h3>Action Items & Assigned Owners:</h3>
<table>
  <thead>
    <tr>
      <th>Task Description</th>
      <th>Owner</th>
      <th>Due Date</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Review and finalize budget spreadsheet targets</td>
      <td>Amit Varma</td>
      <td>Next Session</td>
    </tr>
    <tr>
      <td>Schedule follow-up onboarding review workshop</td>
      <td>Neha Sen</td>
      <td>Within 5 days</td>
    </tr>
  </tbody>
</table>

<p><strong>Next Meeting:</strong> To be decided via email sync.</p>
<p style="font-size: 11px; font-style: italic; color: #777;">Additional Context: "${promptContext || 'None'}" (Generated in ${tone} tone, language: ${language}).</p>`;
      }

      case "contracts": {
        const pA = variables.partyA || "Party A";
        const pB = variables.partyB || "Party B";
        const date = variables.agreementDate || "2026-07-07";
        const terms = variables.paymentTerms || "Standard terms.";

        return `<h1>MUTUAL SERVICE AGREEMENT</h1>
<p>This agreement is entered into effective <strong>${date}</strong>, by and between the following parties:</p>

<p><strong>First Party (Provider):</strong> ${pA}<br><strong>Second Party (Client):</strong> ${pB}</p>

<h3>1. Engagement & Deliverables</h3>
<p>The Provider agrees to perform services as specified in project blueprints. All deliverables will be verified by the Client in writing.</p>

<h3>2. Payment Terms</h3>
<p>${terms}</p>

<h3>3. Confidentiality</h3>
<p>Both parties agree to hold proprietary information in strict confidence and prevent disclosure to third parties during and after this contract term.</p>

<div style="margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 50px;">
  <div>
    <p>_______________________</p>
    <p><strong>For: ${pA}</strong></p>
  </div>
  <div>
    <p>_______________________</p>
    <p><strong>For: ${pB}</strong></p>
  </div>
</div>`;
      }

      case "offer_letter": {
        const candidate = variables.candidateName || "Candidate";
        const role = variables.jobTitle || "Developer";
        const start = variables.startDate || "2026-07-14";
        const ctc = parseFloat(variables.salary || "600000").toLocaleString('en-IN');

        return `<h1>EMPLOYEE OFFER LETTER</h1>
<p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
<p><strong>To,</strong><br>${candidate}</p>

<p>Dear ${candidate},</p>
<p>On behalf of <strong>${brandName}</strong>, we are pleased to offer you the position of <strong>${role}</strong>. We were highly impressed with your credentials and look forward to welcoming you to our tech engineering division.</p>

<h3>Key Terms of Employment:</h3>
<ul>
  <li><strong>Designation:</strong> ${role}</li>
  <li><strong>Commencement Date:</strong> ${start}</li>
  <li><strong>Annual CTC:</strong> ₹${ctc} (payable in monthly components as per tax policy)</li>
  <li><strong>Reporting Office:</strong> ${brandAddress || 'Company Headquarters'}</li>
</ul>

<p>Please review and sign this offer letter within 3 business days to signify your acceptance. We look forward to a mutually rewarding association.</p>

<p>Sincerely,</p>
<p><strong>HR Recruitment Team</strong><br>${brandName}</p>
<div style="margin-top: 30px;">
  <p>Acceptance Signature: _______________________ Date: _________</p>
</div>`;
      }

      case "leave_approval": {
        const emp = variables.employeeName || "Employee";
        const start = variables.leaveStart || "2026-07-07";
        const end = variables.leaveEnd || "2026-07-10";
        const reason = variables.leaveReason || "Personal reasons";

        return `<h1>LEAVE SANCTION ORDER</h1>
<p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
<p><strong>Employee:</strong> ${emp}<br><strong>Employer:</strong> ${brandName}</p>

<p>Dear ${emp},</p>
<p>This is to confirm that your request for leave of absence starting from <strong>${start}</strong> to <strong>${end}</strong> has been officially <strong>APPROVED</strong> by the management.</p>

<p><strong>Leave Reason:</strong> ${reason}</p>
<p>You are requested to hand over critical responsibilities to your team backup prior to departure. We expect you to resume your duties on the next business day following your leave expiration.</p>

<p>Best regards,</p>
<p><strong>Operations Manager</strong><br>${brandName}</p>`;
      }

      case "question_paper": {
        const sub = variables.subject || "Subject";
        const grade = variables.grade || "Class";
        const exam = variables.examName || "Midterm Quiz";
        const syl = variables.chapters || "All chapters.";
        const marks = variables.totalMarks || "100";

        return `<h1>${exam}</h1>
<p><strong>Subject:</strong> ${sub} | <strong>Class:</strong> ${grade}<br><strong>Max Marks:</strong> ${marks} | <strong>Duration:</strong> 2 Hours</p>
<hr style="border-top: 1.5px solid #cbd5e1; margin-bottom: 15px;">

<p><strong>Syllabus Coverage:</strong> ${syl}</p>

<h3>SECTION A (Multiple Choice - 1 Mark Each)</h3>
<p><em>Answer all questions.</em></p>
<ol>
  <li>Which of the following elements is required to construct a valid HTML document link?
    <br>a) &lt;link&gt; | b) &lt;a&gt; | c) &lt;href&gt; | d) &lt;anchor&gt;
  </li>
  <li>What does CSS stand for in web engineering stylesheets?
    <br>a) Computer Style Sheets | b) Creative Styling System | c) Cascading Style Sheets | d) Code Style Sheet
  </li>
</ol>

<h3>SECTION B (Short Answer - 5 Marks Each)</h3>
<ol>
  <li>Explain the difference between absolute paths and relative paths with web-browser examples.</li>
  <li>What is the purpose of LocalStorage inside client browsers? Explain its size constraints.</li>
</ol>

<h3>SECTION C (Long Essay - 10 Marks Each)</h3>
<ol>
  <li>Write a comprehensive layout pipeline detailing how HTML, CSS, and JS render document files dynamically.</li>
</ol>
<p style="text-align: center; margin-top: 20px; font-weight: bold;">-- End of Question Paper --</p>`;
      }

      case "assignment": {
        const sub = variables.assignmentSubject || "Subject";
        const title = variables.assignmentTitle || "Homework assignment";
        const due = variables.dueDate || "2026-07-17";
        const guide = variables.guidelines || "Complete tasks.";

        return `<h1>Homework Assignment: ${title}</h1>
<p><strong>Course / Subject:</strong> ${sub}<br><strong>Submission Due Date:</strong> ${due}</p>
<hr style="border-top: 1.5px solid #cbd5e1; margin-bottom: 15px;">

<h2>Problem Description:</h2>
<p>This homework assignment covers fundamental theories in ${sub}. Students are required to solve issues independently and submit their reports before the deadline.</p>

<h2>Specific Guidelines:</h2>
<p>${guide}</p>

<h2>Evaluation Criteria:</h2>
<ul>
  <li>Correctness of answers and derivations: <strong>50%</strong></li>
  <li>Neatness of documentation layout: <strong>30%</strong></li>
  <li>Resource citations: <strong>20%</strong></li>
</ul>`;
      }

      case "answer_key": {
        const sub = variables.keySubject || "Subject";
        const test = variables.testTitle || "Exam Solutions";
        const count = parseInt(variables.questionsCount || "4");

        let keyHtml = "";
        for (let idx = 1; idx <= count; idx++) {
          keyHtml += `<li><strong>Question ${idx} Solution:</strong>
            <p>Model response detailed logic. Award full marks if the candidate lists step-by-step formulas, derivations, and final unit values. Deduct 1 mark for basic math errors.</p>
          </li>`;
        }

        return `<h1>Official Answer Key: ${test}</h1>
<p><strong>Subject:</strong> ${sub}<br><strong>Date of Publication:</strong> ${new Date().toLocaleDateString()}</p>
<hr style="border-top: 1.5px solid #cbd5e1; margin-bottom: 15px;">

<h2>Grading Instructions:</h2>
<p>Instructors should verify the following official answers against candidate test scripts. Follow marking guidelines strictly.</p>

<ol style="display: flex; flex-direction: column; gap: 15px;">
  ${keyHtml}
</ol>`;
      }

      case "certificate": {
        const name = variables.recipientName || "Recipient";
        const course = variables.courseName || "Course";
        const date = variables.issueDate || "2026-07-07";
        const inst = variables.issuerName || "Institution";

        return `<div style="border: 6px double var(--primary); padding: 40px; text-align: center; background-color: #fafafa; border-radius: 10px;">
  <span class="material-symbols-outlined" style="font-size: 54px; color: var(--primary);">workspace_premium</span>
  <h1 style="font-size: 26px; color: #1e1b4b; margin: 15px 0 5px 0; font-family: var(--font-brand);">CERTIFICATE OF COMPLETION</h1>
  <p style="font-style: italic; font-size: 14px; margin-bottom: 20px;">This certificate is proudly presented to</p>
  
  <h2 style="font-size: 28px; color: var(--primary); font-family: var(--font-brand); margin-bottom: 20px; border-bottom: 2px solid #e2e8f0; display: inline-block; padding: 0 30px 10px 30px;">${name}</h2>
  
  <p style="font-size: 14px; line-height: 1.5; max-width: 500px; margin: 0 auto 25px auto;">For successfully fulfilling all academic requirements and criteria for the designated course of study</p>
  
  <h3 style="font-size: 18px; color: #1e1b4b; margin-bottom: 20px;">"${course}"</h3>
  
  <p style="font-size: 11px; color: #555;">Issued on ${date} by ${inst}</p>
  
  <div style="margin-top: 45px; display: flex; justify-content: space-around;">
    <div>
      <p style="font-size: 12px; font-weight: bold;">_______________________</p>
      <p style="font-size: 10px; color: #777;">Registrar Office</p>
    </div>
    <div>
      <p style="font-size: 12px; font-weight: bold;">_______________________</p>
      <p style="font-size: 10px; color: #777;">Director Signature</p>
    </div>
  </div>
</div>`;
      }

      case "resume": {
        const name = variables.fullName || "Candidate Name";
        const email = variables.email || "email@address.com";
        const phone = variables.phone || "+91 9988776655";
        const role = variables.targetRole || "Associate Professional";
        const exp = variables.experienceYears || "3";
        const skills = variables.coreSkills || "HTML, CSS, JS";

        return `<h1>${name}</h1>
<p><strong>Role Target:</strong> ${role} | <strong>Experience:</strong> ${exp} Years<br><strong>Contact:</strong> ${email} | ${phone}</p>
<hr style="border-top: 1.5px solid #cbd5e1; margin-bottom: 15px;">

<h2>Professional Summary</h2>
<p>Dedicated and results-driven ${role} with ${exp} years of comprehensive industry experience. Passionate about engineering high-performance client solutions, building accessible interfaces, and deploying clean code.</p>

<h2>Core Competencies & Skills</h2>
<p>${skills.split(',').map(s => `<span style="display:inline-block; padding:3px 8px; background:#f1f5f9; border-radius:5px; margin:0 5px 5px 0; font-size:11px;">${s.trim()}</span>`).join('')}</p>

<h2>Professional Experience</h2>
<p><strong>Lead UI Specialist</strong> | Tech Design Hub (2024 - Present)</p>
<ul>
  <li>Pioneered CSS design tokens that improved page layout render times by 20%.</li>
  <li>Collaborated with developers to implement dynamic LocalStorage dashboard logic.</li>
</ul>
<p style="margin-top: 10px;"><strong>Junior Frontend Architect</strong> | Software Builders Ltd (2022 - 2024)</p>
<ul>
  <li>Assisted in building responsive visual A4 print editors for report generators.</li>
  <li>Corrected layouts and debugged rendering bugs in legacy HTML files.</li>
</ul>

<h2>Academic Qualifications</h2>
<p><strong>Bachelor of Technology (Computer Science)</strong><br>State Engineering University | Graduated 2022</p>`;
      }

      case "cover_letter": {
        const name = variables.applicantName || "Applicant Name";
        const company = variables.targetCompany || "Target Company";
        const role = variables.targetJob || "Designation";
        const achieve = variables.highlightAchievement || "Built custom solutions.";

        return `<h1>COVER LETTER</h1>
<p><strong>Sender:</strong> ${name}<br><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
<hr style="border-top: 1.5px solid #cbd5e1; margin-bottom: 15px;">

<p><strong>To,</strong><br>Hiring Committee<br>${company}</p>

<p>Dear Hiring Team,</p>
<p>I am writing to express my strong interest in the <strong>${role}</strong> opening at <strong>${company}</strong>. With a proven record in software engineering and layout systems design, I am confident in my ability to add significant value to your technology department.</p>

<p>During my career, I have constantly worked to bridge design and engineering gaps. A particular highlight of my experience includes: <em>${achieve}</em>. I thrive in collaborative environments where performance, accessibility, and clean code are prioritized.</p>

<p>I look forward to discussing how my experience fits the goals of ${company}. Thank you for your time and consideration.</p>

<p>Sincerely,</p>
<p><strong>${name}</strong></p>`;
      }

      case "menu_card": {
        const restaurantName = variables.restaurantName || "DEEPIKA Pickles";
        const tagline = variables.tagline || "Traditional Homemade Pickles";
        const contactPhone = variables.contactPhone || "+91 9652286824";
        const contactEmail = variables.contactEmail || "deepikapickles26@gmail.com";
        
        let vegRows = "";
        if (variables.vegItems) {
          variables.vegItems.split(';').forEach(itemStr => {
            const parts = itemStr.split(',');
            if (parts.length >= 2) {
              const nameParts = parts[0].split('/');
              const enName = nameParts[0].trim();
              const telName = nameParts[1] ? nameParts[1].trim() : "";
              const price = parts[1].trim();
              vegRows += `
              <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8.5px; font-size: 10px; font-weight: 700; color: #ffffff;">
                <div style="display: flex; flex-direction: column; max-width: 82%;">
                  <span style="font-family: 'Outfit', sans-serif; font-size: 11px; font-weight: 800; color: #ffffff;">${enName}</span>
                  ${telName ? `<span style="font-family: 'Noto Serif Telugu', serif; font-size: 9px; color: #dfa04c; margin-top: 0.5px;">${telName}</span>` : ""}
                </div>
                <span style="flex-grow: 1; border-bottom: 1.2px dotted rgba(255, 255, 255, 0.25); margin-bottom: 3.5px; margin-left: 5px; margin-right: 5px;"></span>
                <span style="font-family: 'Montserrat', sans-serif; font-size: 11px; font-weight: 800; color: #f3ba1c;">${price}</span>
              </div>`;
            }
          });
        }

        let nonVegRows = "";
        if (variables.nonVegItems) {
          variables.nonVegItems.split(';').forEach(itemStr => {
            const parts = itemStr.split(',');
            if (parts.length >= 2) {
              const nameParts = parts[0].split('/');
              const enName = nameParts[0].trim();
              const telName = nameParts[1] ? nameParts[1].trim() : "";
              const price = parts[1].trim();
              nonVegRows += `
              <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8.5px; font-size: 10px; font-weight: 700; color: #ffffff;">
                <div style="display: flex; flex-direction: column; max-width: 82%;">
                  <span style="font-family: 'Outfit', sans-serif; font-size: 11px; font-weight: 800; color: #ffffff;">${enName}</span>
                  ${telName ? `<span style="font-family: 'Noto Serif Telugu', serif; font-size: 9px; color: #dfa04c; margin-top: 0.5px;">${telName}</span>` : ""}
                </div>
                <span style="flex-grow: 1; border-bottom: 1.2px dotted rgba(255, 255, 255, 0.25); margin-bottom: 3.5px; margin-left: 5px; margin-right: 5px;"></span>
                <span style="font-family: 'Montserrat', sans-serif; font-size: 11px; font-weight: 800; color: #f3ba1c;">${price}</span>
              </div>`;
            }
          });
        }

        return `<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Noto+Serif+Telugu:wght@500;700&family=Outfit:wght@400;500;600;700;800&family=Great+Vibes&display=swap" rel="stylesheet">
        
        <style>
          /* Override parent A4 sheet padding and backgrounds to match the food point layout exactly */
          .a4-sheet-paper {
            padding: 0 !important;
            background-color: #1a0206 !important;
            background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cpath d='M40 0 L40 80 M0 40 L80 40' stroke='%23f3ba1c' stroke-opacity='0.03' stroke-width='1.2'/%3E%3C/svg%3E") !important;
            background-repeat: repeat !important;
          }
        </style>

        <div class="food-point-wrapper" style="
          --primary-yellow: #f3ba1c;
          --maroon: #58081a;
          --maroon-dark: #36030e;
          --gold: #d4af37;
          --white: #ffffff;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          overflow: hidden;
          background-color: var(--maroon);
          border: 6px solid var(--primary-yellow);
          position: relative;
        ">
          <!-- Top Half Spread -->
          <div style="height: 350px; display: grid; grid-template-columns: 50% 50%; position: relative; box-sizing: border-box;">
            <!-- Left Top Panel (Yellow Cover) -->
            <div style="
              background-color: var(--primary-yellow);
              padding: 20px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              align-items: center;
              color: var(--maroon-dark);
              position: relative;
              box-sizing: border-box;
            ">
              <div style="
                background-color: var(--maroon);
                color: var(--primary-yellow);
                width: calc(100% + 40px);
                margin-top: -20px;
                padding: 15px 10px;
                text-align: center;
                box-shadow: 0 4px 10px rgba(0,0,0,0.15);
              ">
                <h2 style="font-family: 'Montserrat', sans-serif; font-size: 26px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; line-height: 1.0; margin: 0;">DEEPIKA</h2>
                <p style="font-family: 'Great Vibes', cursive; font-size: 28px; color: var(--white); margin: -4px 0 0 0; line-height: 1.0;">Food Point</p>
              </div>
              
              <div style="
                width: 155px;
                height: 155px;
                border-radius: 50%;
                border: 4px solid var(--maroon);
                overflow: hidden;
                box-shadow: 0 6px 15px rgba(0,0,0,0.25);
                background: white;
                margin: 10px 0;
              ">
                <img src="mango_pickle.png" style="width: 100%; height: 100%; object-fit: cover;">
              </div>

              <div style="display: flex; gap: 6px; width: 100%; justify-content: center; margin-top: 5px;">
                <span style="background-color: var(--maroon); color: var(--primary-yellow); font-size: 8px; font-weight: 800; letter-spacing: 0.8px; text-transform: uppercase; padding: 4px 8px; border-radius: 4px;">Veg</span>
                <span style="background-color: var(--maroon); color: var(--primary-yellow); font-size: 8px; font-weight: 800; letter-spacing: 0.8px; text-transform: uppercase; padding: 4px 8px; border-radius: 4px;">Non-Veg</span>
                <span style="background-color: var(--maroon); color: var(--primary-yellow); font-size: 8px; font-weight: 800; letter-spacing: 0.8px; text-transform: uppercase; padding: 4px 8px; border-radius: 4px;">Organic</span>
              </div>
            </div>

            <!-- Right Top Panel (Maroon Staggered Stack) -->
            <div style="
              background-color: var(--maroon-dark);
              padding: 25px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              align-items: center;
              position: relative;
              box-sizing: border-box;
            ">
              <div style="position: relative; width: 260px; height: 160px; margin-top: 15px;">
                <div style="width: 80px; height: 80px; border: 3px solid var(--primary-yellow); box-shadow: 0 5px 12px rgba(0,0,0,0.4); border-radius: 4px; overflow: hidden; position: absolute; top: 0; left: 10px; transform: rotate(-6deg);"><img src="mango_pickle.png" style="width:100%; height:100%; object-fit:cover;"></div>
                <div style="width: 80px; height: 80px; border: 3px solid var(--white); box-shadow: 0 5px 12px rgba(0,0,0,0.4); border-radius: 4px; overflow: hidden; position: absolute; top: 30px; left: 90px; transform: rotate(4deg);"><img src="lemon_pickle.png" style="width:100%; height:100%; object-fit:cover;"></div>
                <div style="width: 80px; height: 80px; border: 3px solid var(--primary-yellow); box-shadow: 0 5px 12px rgba(0,0,0,0.4); border-radius: 4px; overflow: hidden; position: absolute; top: 60px; left: 170px; transform: rotate(-4deg);"><img src="chicken_pickle.png" style="width:100%; height:100%; object-fit:cover;"></div>
              </div>

              <div style="font-family: 'Great Vibes', cursive; font-size: 34px; color: var(--primary-yellow); text-align: center; margin-bottom: 5px;">Thank You...</div>
            </div>
          </div>

          <!-- Horizontal Separator Bar -->
          <div style="height: 8px; background-color: var(--primary-yellow); width: 100%; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>

          <!-- Bottom Menu Content -->
          <div style="
            flex: 1;
            display: grid;
            grid-template-columns: 46% 54%;
            gap: 20px;
            padding: 25px 20px 10px 20px;
            box-sizing: border-box;
            overflow: hidden;
          ">
            <!-- Left Column: Vegetarian (12 items) -->
            <div style="display: flex; flex-direction: column;">
              <div style="background-color: var(--primary-yellow); color: var(--maroon-dark); font-family: 'Montserrat', sans-serif; font-size: 11px; font-weight: 900; letter-spacing: 1.5px; text-transform: uppercase; padding: 6px 12px; border-radius: 30px; text-align: center; margin-bottom: 15px; box-shadow: 0 3px 8px rgba(0,0,0,0.15);">Vegetarian Pickles</div>
              <div style="display: flex; flex-direction: column; justify-content: space-evenly; flex: 1;">
                ${vegRows}
              </div>
            </div>

            <!-- Right Column: Non-Vegetarian + Far Right Photo Stack -->
            <div style="display: flex; flex-direction: column;">
              <div style="background-color: var(--primary-yellow); color: var(--maroon-dark); font-family: 'Montserrat', sans-serif; font-size: 11px; font-weight: 900; letter-spacing: 1.5px; text-transform: uppercase; padding: 6px 12px; border-radius: 30px; text-align: center; margin-bottom: 15px; box-shadow: 0 3px 8px rgba(0,0,0,0.15);">Non-Vegetarian Pickles</div>
              
              <div style="display: flex; height: 100%; justify-content: space-between; flex: 1;">
                <!-- Items List area -->
                <div style="flex: 1; margin-right: 15px; display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
                  <div style="display: flex; flex-direction: column; justify-content: space-evenly; flex: 1;">
                    ${nonVegRows}
                  </div>
                  
                  <div style="flex-grow: 1;"></div>
                </div>

                <!-- Far Right Photo Stack -->
                <div style="width: 75px; display: flex; flex-direction: column; gap: 15px; margin-top: 10px;">
                  <div style="width: 75px; height: 75px; border: 2px solid var(--primary-yellow); border-radius: 4px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.3);"><img src="mango_pickle.png" style="width: 100%; height: 100%; object-fit: cover;"></div>
                  <div style="width: 75px; height: 75px; border: 2px solid var(--primary-yellow); border-radius: 4px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.3);"><img src="lemon_pickle.png" style="width: 100%; height: 100%; object-fit: cover;"></div>
                  <div style="width: 75px; height: 75px; border: 2px solid var(--primary-yellow); border-radius: 4px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.3);"><img src="chicken_pickle.png" style="width: 100%; height: 100%; object-fit: cover;"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Yellow Address Booking Bar at bottom -->
          <div style="
            background-color: var(--primary-yellow);
            color: var(--maroon-dark);
            padding: 10px 15px;
            text-align: center;
            font-family: 'Montserrat', sans-serif;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 0.8px;
            text-transform: uppercase;
            box-shadow: inset 0 2px 5px rgba(0,0,0,0.1);
          ">
            M. 5th Avenue, Hyderabad, India | ${contactEmail} | Order Now: <span style="color: var(--maroon);">${contactPhone}</span>
          </div>
        </div>`;
      }

      default:
        return `<h1>Generated Document</h1><p>DocGenius AI generated content draft...</p><p>Context: "${promptContext}"</p>`;
    }
  }
};

// Export database
window.DocumentDB = DocumentDB;
