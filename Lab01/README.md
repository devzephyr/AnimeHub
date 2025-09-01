# Week 1 Lab Practice: Building Your First Web Page with HTML & CSS

## 1. Objective:

* 1.1. Create a new folder for your lab work.
* 1.2. Write a basic HTML5 document with proper structure (`<!DOCTYPE html>`, `<html>`, `<head>`, `<body>`).
* 1.3. Add common HTML elements: headings, paragraphs, links, and an image.
* 1.4. Apply attributes (`href`, `src`, `alt`, `class`, `id`).
* 1.5. Create and link an external CSS stylesheet.
* 1.6. Use CSS selectors and properties (text, colors, margins, backgrounds) to style the page.
* 1.7. Verify the webpage renders correctly in a browser.

---

## 2. Instructions:

### Step 1: Set Up Your Workspace

* 2.1. Create a folder named `lab01`.
* 2.2. Inside it, create two files:

  * `index.html`
  * `styles.css`

---

### Step 2: Build the HTML Structure

* 2.3. Open `index.html` in a text editor (VS Code recommended).
* 2.4. Write the HTML5 boilerplate:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My First Web Page</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <h1>Welcome to My Web Page</h1>
    <p>This is my first paragraph in HTML.</p>
    <a href="https://www.senecapolytechnic.ca">Visit Seneca Polytechnic</a>
    <br>
    <img src="seneca.png" alt="Seneca Logo" width="200">
    <ul>
      <li>HTML</li>
      <li>CSS</li>
      <li>JavaScript</li>
    </ul>
  </body>
</html>
```

---

### Step 3: Add CSS Styling

* 2.5. Open `styles.css` in your editor.
* 2.6. Add basic styling using selectors:

```css
h1 {
  color: darkblue;
  text-align: center;
}

p {
  font-size: 18px;
  color: gray;
}

a {
  color: red;
  text-decoration: none;
}

img {
  border: 2px solid black;
  margin: 10px;
}
```

---

### Step 4: Experiment with Attributes

* 2.7. Give your heading a `class="title"`.
* 2.8. Add a unique `id="main-paragraph"` to your `<p>`.
* 2.9. Update your CSS to style by class and id:

```css
.title {
  font-family: Arial, sans-serif;
}

#main-paragraph {
  background-color: #f0f0f0;
  padding: 10px;
}
```

---

### Step 5: Test in Browser

* 2.10. Open `index.html` in Chrome/Firefox/Edge.
* 2.11. Verify that:

  * Heading is styled.
  * Paragraph has background and padding.
  * Link works and opens Seneca’s website.
  * Image displays with a border.
  * List shows properly.

---

## 3. Deliverables:

Students must submit a folder `lab01` in their GitHub repo containing:

* 3.1. (25%) - `index.html` file with proper structure and tags.
* 3.2. (25%) - `styles.css` file with at least 5 different CSS rules (covering text, color, margin/padding, background, and border). 
* 3.3. (20%) - `report01.md` contenting screenshot of the rendered web page in a browser and,
* 3.4. (30%) - Short reflection:
  * **What did you learn?** (10%)
  * **What challenges did you face?** (10%)
  * **How did you solve them?** (10%)

---

## 4. Summary:

By completing this lab, you will:

* 4.1. Understand how HTML and CSS work together.
* 4.2. Practice using common HTML tags and attributes.
* 4.3. Apply CSS selectors and properties to style content.
* 4.4. Gain confidence in testing and debugging web pages in a browser.
