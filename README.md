# Document Creation & Lab Experiments

This repository houses smart document generation content, lab reports, and coding implementations.

## 🚀 Experiment 1: AVL Tree Construction, Insertion, and Deletion

A C program to construct an AVL tree for a given set of elements, and implement insert/delete operations on it. It outputs the in-order traversal of the tree.

### 📁 Files and Resources

- **C Implementation Code:** [`avl_tree.c`](avl_tree.c)
- **Microsoft Word Document:** [`adsa1.docx`](adsa1.docx) (Downloadable report)
- **HTML Web View:** [adsa1.html](https://thummalaharshithanandini-create.github.io/Document-creation/adsa1.html) (View directly on Chrome via GitHub Pages)

---

### 💻 C Code Preview

```c
#include <stdio.h>
#include <stdlib.h>

struct TreeNode {
    int data;
    struct TreeNode* left;
    struct TreeNode* right;
    int height;
};

// ... (See avl_tree.c for complete source code)
```

---

### 📘 How to Run the C Code

Compile using any standard C compiler (GCC, Clang, MSVC):

```bash
gcc avl_tree.c -o avl_tree
./avl_tree
```
