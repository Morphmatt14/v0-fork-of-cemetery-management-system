**System Requirements Document (SRD)**
======================================

**Client Portal**
-----------------

**1\. Overview Section**
------------------------

**Description:**The overview section provides a general summary of the client’s information and activities.

**Requirements:**

*   Display essential client information at a glance.
    
*   Allow flexibility for future adjustments and UI improvements.
    
*   Should be easy to understand, organized, and user-friendly.
    

**2\. My Lots Section**
-----------------------

**Description:**Displays all cemetery lots assigned to the client.

**Functional Requirements:**

*   The system must show all lots assigned to the client by the employee.
    
*   Each lot must display the following details:
    
    *   Deceased person’s name (if applicable)
        
    *   Lot status (Vacant / Under Payment / Fully Paid)
        
    *   Lot details (location, type, and other metadata)
        
*   The client must be able to view complete details per lot.
    

**3\. Map Viewer Section**
--------------------------

**Description:**Allows clients to visually browse the map created by employees.

**Functional Requirements:**

*   Display the map with drawn lots created and updated by employees.
    
*   Show available lots for potential purchase.
    
*   Clients can click any lot to view:
    
    *   Lot details
        
    *   Name of the deceased (if applicable)
        
*   If a lot is vacant, the client must be able to request an appointment with an employee.
    

**Non-Functional Requirements:**

*   **Remove the “Get Directions” feature** since no coordinates are used.
    
*   Map will be image-based only (no Google Maps API integration).
    
*   Interface should remain fast and responsive without relying on external mapping APIs.
    

**4\. Payments Section**
------------------------

**Description:**Provides payment information and financial status.

**Functional Requirements:**

*   Display complete payment history.
    
*   Show current balance (if applicable).
    
*   Indicate the client’s monthly payment status:
    
    *   Paid
        
    *   Under Payment
        
    *   Overdue
        

**5\. Request Section**
-----------------------

**Description:**Allows the client to send formal requests to employees.

**Functional Requirements:**

*   Client may send requests including:
    
    *   Lot maintenance
        
    *   Document requests
        
*   Support two-way messaging:
    
    *   Employee can reply
        
    *   Client can reply
        
*   This section is linked to the **Inquiries** module on the client side.
    

**6\. Notification Section**
----------------------------

**Description:**Shows all relevant updates and alerts for the client.

**Functional Requirements:**

*   Display new updates added by employees, including:
    
    *   New map uploads
        
    *   Billing and payment reminders
        
    *   Important client-related updates
        
*   Ensure notifications are displayed clearly and in real-time or near real-time.
    

**7\. Inquiries Section**
-------------------------

**Description:**Handles all client inquiries related to lots and appointments.

**Functional Requirements:**

*   Clients may message or inquire about lots or appointments.
    
*   This section can be merged with the **Request Section** for simplicity.
    

**Recommendation:**

*   Consider merging Requests + Inquiries into a single communication module to reduce redundancy.