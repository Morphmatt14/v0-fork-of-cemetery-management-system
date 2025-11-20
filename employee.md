
**Employee Portal**
-------------------

### **Overview Section**

The overview section should reflect all important data: Lots, Clients, Burials, Payments, Inquiries, Appointments, and Payments (again—remove duplicates if needed).

### **Lots Section**

*   Employees will assign a lot owner.
    
*   The labels for the lot types are incorrect:
    
    *   _Lawn Lot_ should be labeled **Standard**
        
    *   _Garden Lot_ should be labeled **Premium**
        
*   Remove the **Add New Lot** feature because adding lots is still based on the map drawing. Lots should only be created through the map tool.
    

### **Burial Section**

Very similar to the Lots Section, but instead of assigning a lot owner:

*   You assign the **deceased person** to a lot.
    
*   You can delete and edit burial details.
    
*   You can view full burial information.
    

### **Clients Section**

When adding a new client:

*   The system should automatically create the client’s account.
    
*   The employee will set the username, password, and other details.
    
*   Employees can **edit**, **delete**, and **view** client details.
    
*   Employees can send messages to clients.
    
*   Clients can reply, but replies will appear on the **Client Portal**.
    

### **Payment Section**

This is where employees update a client's payment status:

*   Paid
    
*   Under Payment
    
*   Overdue
    

### **Maps Section**

This part is mostly correct. The maps properly reflect the lots when an employee draws them.However, there are issues:

*   The lot types reflected on the map are wrong (Standard vs. Premium, same as mentioned earlier).
    
*   When drawing a lot, the system does not automatically set the name. You must manually edit it.
    
*   This naming feature is not necessary. Editing and assigning lot owner names should be managed in the **Lots Section**, not during map drawing.
    

### **News Section**

Used to send notifications to clients about updates, typically related to memorial activities or announcements.

### **Inquiries Section**

This section manages:

*   Client inquiries
    
*   Client requests
    
*   Guest inquiries (from outside the system)
    

Features:

*   Employees can reply to guest messages via email or phone.
    
*   Employees can mark items as “Completed” to separate them from pending requests.
    

### **Reports Section**

This section shows all exportable data.Employees can export reports to **Word** or **Excel**.

### **Notification Bell (Top Right)**

Next to the Logout button.This is the **messaging module** between **Admin and Employees**, and it must support two-way communication.

**Add This New Section:**
-------------------------

### **Front Page Management**

Employees must be able to:

*   Update the front page of the website
    
*   Edit labels and pricing displayed to the public
    
*   Identify who is logged in (employee details should appear somewhere inside the portal)
    
*   The Employee Portal should not show the account identity on the login screen; only after logging in.
    

**Important Notes:**
--------------------

*   **All actions performed by an employee should require Admin approval.**However, adding new clients and creating maps could be exceptions—up to your recommendation.
    

Suggested approval logic:

*   Creating or editing lots = needs admin approval
    
*   Burial assignments = needs admin approval
    
*   Payment updates = needs admin approval
    
*   Adding new clients = admin approval optional
    
*   Creating maps = admin approval optional (depends on your workflow)
    
*   **Logout Behavior**When an employee logs out, the system should redirect them to the ,  Employee Login Page not the **Admin Login Page**.
    