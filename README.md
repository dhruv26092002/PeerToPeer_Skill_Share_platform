Peer to Peer skil sharing system 🚀
A decentralized, zero-fee platform bridging the trust gap in online learning and freelance micro-mentorship through a secure Token Credit economy.

📖 Table of Contents
About the Project

Key Features

System Architecture

Database Design

Tech Stack

Getting Started

License

🌐 About the Project
Traditional skill-sharing platforms rely on centralized fiat-currency models that impose high transaction fees (often up to 20%) and lack granular security for short-term interactions. The Peer to Peer skil sharing system solves this by establishing a trustless ecosystem where users can dynamically act as both mentors and learners. By bartering technical expertise using an internal Token Credit (TC) mechanism, the platform achieves a strict 0% intermediary fee for all direct user node exchanges.

✨ Key Features
Direct TC Exchange: Trade skills without fiat currency gateways, ensuring 100% of the value stays between the users.

Locked-Escrow Handshake Protocol: Automatically isolates a learner's Token Credits into a secure PostgreSQL vault when a contract is initiated, mathematically preventing double-spending.

Cryptographic OTP Release: Funds are strictly released to the mentor's wallet only when the learner inputs a mathematically verified One-Time Password generated for that specific session.

Auto-Claim Protocol: A built-in background timer autonomously resolves abandoned contracts to prevent user "ghosting" without manual administrative intervention.

Cyber-Dark Aesthetic: A high-fidelity, responsive Single Page Application (SPA) designed with glassmorphism UI elements to reduce eye strain and establish a modern identity.

🏗️ System Architecture
The platform operates on a decoupled, three-tier architecture:

Presentation Layer: A dynamic React client utilizing Framer Motion for state transitions without full page reloads.

Business Logic Layer: A Java Spring Boot RESTful API orchestrating the core financial escrow logic, authenticated securely via Spring Security and BCrypt hashing.

Data Persistence Layer: An ACID-compliant PostgreSQL database guaranteeing that digital ledger states either fully succeed or completely roll back, ensuring zero credit loss.

🗄️ Database Design
The relational schema is mapped via Spring Data JPA and revolves around three core entities:

Student: Manages user identity, authentication credentials, available_tc, and locked_tc balances.

Resource: Represents the specific technical expertise broadcasted to the global marketplace by a node.

Contract: The legally binding digital handshake logging the mentor_id, learner_id, total_amount in escrow, and real-time status (e.g., LOCKED, ACTIVE).

💻 Tech Stack
Frontend

React.js

Tailwind CSS

Framer Motion

Backend

Java (JDK 17+)

Spring Boot (RESTful APIs, Security, Mail)

Hibernate / Spring Data JPA

Database & Tools

PostgreSQL

Postman (API Testing)

Git & GitHub

🚀 Getting Started
Follow these instructions to get a copy of the project up and running on your local machine.

Prerequisites
Java Development Kit (JDK 17+)

Node.js and npm

PostgreSQL installed and running locally on port 5432
