# Crafted Pizza — Full-Stack Restaurant Ordering System

A full-stack restaurant ordering platform** built for **practicing and using FIREBASE as a backend**, enabling customers to browse menus, place orders, and pay via daraja M-Pesa — while giving admins real-time control over orders, menu items, and operations.

---

##  Live Demo

🔗https://crafted-pizza-project.vercel.app/

---

##  Overview

Crafted Pizza is a modern digital solution tailored for a fast-growing restaurant business with multiple branches 

The platform delivers:

* A seamless **customer ordering experience**
* A powerful **real-time admin dashboard**
* Integrated **M-Pesa payments (Daraja API)**
* Scalable **cloud-based infrastructure**

---

##  Tech Stack

### Frontend

* **React 18 + TypeScript**
* **Vite 7**
* **Tailwind CSS v4**
* **Framer Motion**
* **React Router v7**

### Backend & Cloud

* **Firebase Firestore (Database)**
* **Firebase Auth (Google OAuth)**
* **Firebase Storage**
* **Firebase Cloud Functions v2 (Node.js 20)**

### Infrastructure

* **Frontend Deployment:** Vercel
* **Functions Hosting:** Google Cloud Run 


### Payments

* **Safaricom Daraja API (M-Pesa STK Push)**

---

##  Core Features

### Customer Experience

* **Landing Page**

  * Animated hero section
  * Highlighted popular dishes
  * Smooth scroll animations

* **Menu Browsing**

  * Categorized (Pizzas, Burgers, Sides, Drinks, Desserts)
  * Real-time availability control

* **Cart System**

  * Persistent cart
  * Live item count badge
  * Quantity control & removal

* **Checkout Flow**

  * Pre-filled user details via Google Auth
  * Kenyan phone number validation

* **M-Pesa Payments**

  * STK Push (no card required)
  * Secure mobile confirmation

* **Real-Time Order Confirmation**

  * Live updates via Firestore `onSnapshot`

* **Order History (`/orders`)**

  * Tracks all past orders
  * Real-time status updates:

    * Received → Preparing → Ready → Delivered

---

###  Admin Dashboard

* **Role-Based Access Control**

* **Real-Time Metrics**

  * Revenue
  * Orders today
  * Pending orders
  * Active menu items

* **Menu Management**

  * Add / Edit / Delete items
  * Toggle availability instantly

* **Image Optimization**

  * Automatic WebP conversion (Canvas API)
  * Up to 70% size reduction

* **Order Management**

  * Status pipeline control:

    * Pending → Preparing → Ready → Delivered → Cancelled

* **Notifications System**

  * Sound alerts (Web Audio API)
  * Animated order banners

* **Developer Tools**

  * Payment simulation (sandbox testing)

---




---

##  Data Architecture (Firestore)

### Collections:

* **users/**
* **menuItems/**
* **orders/**

### Key Concepts:

* Role-based access (`customer` vs `admin`)
* Nested menu categories
* Order lifecycle tracking
* Payment metadata storage (M-Pesa)

---

##  M-Pesa Integration Flow


Customer places order
        →
Frontend calls Cloud Function
       →
STK Push sent to Safaricom
       →
Customer confirms via phone
       →
Daraja callback triggers backend
        →
Firestore updates order status
        →
Frontend updates in real-time
       →
Admin dashboard notifies instantly




##  Image Optimization (WebP)

* Converts images **client-side** using Canvas API
* Supports all formats (JPEG, PNG, HEIC, AVIF)
* Uploads optimized WebP to Firebase Storage

### Benefits:

* Faster load times
* Lower bandwidth usage
* Reduced storage costs

---

##  Authentication & Security

* **Google OAuth (Firebase Auth)**
* No password storage
* Role-based access control
* Protected admin routes

### Security Highlights:

* Firestore rules enforce:

  * User data isolation
  * Admin-only write access
* Session-like behavior handled via Firebase Auth tokens

---

##  Getting Started

### Prerequisites

* Node.js 20+
* Firebase CLI
* Firebase project setup
* Safaricom Daraja account

---

### Installation

```bash
 clone project: https://github.com/ERIC-KAIGUA/crafted_pizza_project.git
npm install

cd functions
npm install
cd ..
```

---

### Environment Setup

Create `.env`:

```env
VITE_STK_PUSH_URL=your_cloud_function_url
```

---

### Run Locally

```bash
npm run dev
```

---

### Deploy

#### Cloud Functions

```bash
firebase deploy --only functions
```

#### Frontend (Vercel)

```bash
vercel --prod
```

---

##  Required Firestore Index

| Field      | Order      |
| ---------- | ---------- |
| customerId | Ascending  |
| createdAt  | Descending |

---



---

##  Cost Efficiency

At moderate scale (~1,000 orders/month):

* Firestore: Free tier
* Storage: Free tier
* Functions: Free tier
* Auth: Free

 Estimated cost: **$0/month**

---



---





---

##  License

This is a non-commercial personal project created for portfolio purposes only. 
It is NOT affiliated with, owned by, or connected to any actual business entity. 
All content and imagery are used for demonstration purposes.

---

##  Author

Built as a **production-grade full-stack system** focusing on:

* Real-world payments
* Performance optimization
* Scalable cloud architecture

---

##  Final Note

This project demonstrates:

* Real-time systems design
* Payment integration in Africa (M-Pesa)
* Full-stack engineering best practices

* I'm open to any feedback on where the project can be improved.
* You can also update the project features if you wish to.


---



