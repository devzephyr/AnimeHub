# Lab 09 Report – Full-Stack Integration

- Name: Adeyemi Folarin
- Student ID: 123224214
- Date: November 17, 2025

## Evidence

### 1. Server & Database Setup

**Server Start**
![Server Start](screenshots/server-start.png)

**MongoDB Compass (Members Collection)**
![MongoDB Compass](screenshots/compass-members.png)

### 2. Backend API Testing (Postman)

**Empty List (GET)**
![Postman Empty List](screenshots/postman-get-empty.png)

**Invalid POST (Validation Error)**
![Postman Invalid POST](screenshots/postman-post-invalid.png)

**Valid POST (Registration)**
![Successful Registration Backend](screenshots/successful-registration-backend.png)

**Get Detail (GET :id)**
![Postman Get Detail](screenshots/postman-get-detail.png)

**Update Member (PUT)**
![Successful Update Backend](screenshots/successful-update-backend.png)

**Duplicate Email (409 Conflict)**
![Postman Duplicate Email](screenshots/postman-duplicate.png)

**Delete Member (DELETE)**
![Successful Delete Backend](screenshots/successful-delete-backend.png)

### 3. Frontend Integration

**Registration Flow**
![Successful Registration Frontend](screenshots/successful-registration-frontend.png)

**Update Flow**
![Successful Update Frontend](screenshots/succesful-update-frontend.png)

## Reflection

1. **Full-stack integration vs. Lab07/08**  
   I finally replaced the JSON file loop from Lab07 with an actual Mongoose layer, which meant I could stop worrying about manual file locking and timestamp bookkeeping. Because Lab08 already familiarized me with Compass and mongosh, I was comfortable watching documents update live while I hit the Express endpoints. Debugging changed as well: instead of `console.log` in file IO, I relied on Mongo connection logs, Mongoose validation errors, and network traces from both Postman and the browser’s DevTools to make sure the API/DOM stayed in sync.

2. **Validation & safety**  
   I now have DTO rules enforced by `express-validator` before the request ever touches Mongo, and Mongoose schema validation (unique email, enum roles, min/max lengths) as a second line of defense. It felt good to see duplicate emails surface as clean 409 responses. The next security improvements would be tightening CORS to a known origin for production.

3. **Next steps**  
   If I had more time I would start planning authentication (even a simple API key) so random users can’t spam the registry.



