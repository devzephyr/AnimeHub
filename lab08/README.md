# Week 8 Lab Practice: MongoDB & Data Persistence

## 1. Objective

- 1.1. Install and run **MongoDB Community Server** locally on your computer.
- 1.2. Explore **MongoDB Compass** to view databases, collections, and documents.
- 1.3. Use the **Mongo Shell (`mongosh`)** to perform CRUD operations directly against your **local MongoDB server**.
- 1.4. Practice **creating**, **reading**, **updating**, and **deleting** documents from a collection.
- 1.5. Understand how data is stored as JSON-like documents, and observe how `_id`, fields, and structure evolve.
- 1.6. Build confidence with Mongo Shell commands before integrating MongoDB with Express in Week 9.

Theme continuity: continue your **Middle-earth Legends** project. You’ll now persist the “Fellowship Registry” data in a real MongoDB database instead of a JSON file.

---

## 2. Instructions

### Step 1: Install & Verify MongoDB

- 2.1. Download and install **MongoDB Community Server** ([https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)).

  - Use defaults during installation (run as a Windows Service or macOS/Linux daemon).

- 2.2. Install **MongoDB Compass** for a GUI view of your local database. ([https://www.mongodb.com/products/compass](https://www.mongodb.com/products/compass))
- 2.3. Verify installation:

  - Open your terminal or PowerShell and run:

    ```bash
    mongo --version
    mongosh
    ```

  - In Mongo Shell, confirm connection to the default port (`mongodb://localhost:27017`).
  - Exit with `exit`.

---

### Step 2: Create a Database & Collection

- 2.4. Open **mongosh** in your terminal.
- 2.5. Create a new database named `middleearth` and switch to it:

  ```bash
  use middleearth
  ```

- 2.6. Create a new collection named `fellowship`:

  ```bash
  db.createCollection("fellowship")
  ```

- 2.7. Insert your first document:

  ```bash
  { name: "Aragorn", race: "Human", role: "Ranger", age: 87 }
  ```

- 2.8. Verify that MongoDB automatically added an `_id` field.

---

### Step 3: Perform CRUD Operations in Mongo Shell

1. **Create (Insert)**

   - Insert multiple Fellowship members:

     ```bash
     [
       { name: "Legolas", race: "Elf", role: "Archer", age: 2931 },
       { name: "Gimli", race: "Dwarf", role: "Warrior", age: 140 },
       { name: "Frodo", race: "Hobbit", role: "Ring Bearer", age: 50 }
     ]
     ```

2. **Read (Find)**

   - Retrieve all documents using `find().pretty()`:

   - Retrieve documents with a filter find({ race: "Elf" })

3. **Update**

   - Update one document, e.g., change Aragorn's role to "King of Gondor".
   - Update multiple documents to add a new field `alliance` with the value "The Fellowship" and set it for all members.

4. **Delete**

   - Delete one record, removing "Boromir" from the collection.

   - Delete all (use with caution) to clear the collection.

---

### Step 4: Validation & Observation

- 2.9. Verify every document includes:

  - A unique `_id` (auto-generated).
  - Proper field names and types.
  - Consistent structure (same key naming conventions).

- 2.10. Observe MongoDB's flexibility:

  - Add a new field to one document (e.g., `weapon: "Andúril"`) and confirm others remain unaffected.

- 2.11. Use `db.fellowship.find().pretty()` after every operation to visualize changes.

- 2.12. Capture **screenshots** showing:

  - Database and collection names.
  - Successful CRUD operations.
  - Resulting collection data.

---

## 3. Deliverables

Submit a folder **`Lab08`** in your GitHub repo containing:

- 3.1. (20%) — **Database Setup Evidence**

  - Screenshot of MongoDB running locally and connected through `mongosh`.

- 3.2. (30%) — **CRUD Operations (Shell)**

  - Screenshots showing Create, Read, Update, and Delete results.

- 3.3. (25%) — **Data Consistency & Structure**

  - Fields: `name`, `race`, `role`, `age`, and at least one custom field.

- 3.4. (25%) — **report08.md**

  - Short reflection answering:

    1. What advantages did you notice using MongoDB vs. a flat JSON file?
    2. How does flexible document structure compare to fixed schemas?
    3. What do you expect to change once MongoDB connects to Express next week?

---

## 4. Summary

By completing this lab, you will:

- 4.1. Successfully install and operate MongoDB locally.
- 4.2. Gain hands-on experience managing data using **Mongo Shell**.
- 4.3. Practice CRUD fundamentals directly within MongoDB.
- 4.4. Understand document flexibility, automatic `_id` generation, and field updates.
- 4.5. Be fully prepared to connect MongoDB to your Express API in Week 9 and see live persistence in your web app.

