---

#JavaScript Functions for Oracle Apex Pages
JavaScript plays an essential role in enhancing Oracle Apex applications by adding interactivity and customizing page behavior. Whether you're new to Oracle Apex or an experienced developer, incorporating common JavaScript functions can streamline your projects and improve efficiency.
This blog outlines a library of JavaScript functions that can be used within Oracle Apex applications, explains their purposes, and explores a specific example detailing how to disable the interactive grid row selector.

---

#What Are JavaScript Functions for Oracle Apex?
JavaScript functions take predefined actions on your Oracle Apex pages - such as modifying HTML elements, alerting errors, or performing validations. With Oracle Apex, adding custom JavaScript enhances the user experience by building dynamic features that native components can't achieve on their own.
Below, we provide a collection of useful JavaScript functions you can integrate directly, followed by step-by-step implementation details for one specific use case.
Why JavaScript Matters in Oracle Apex
Enhanced Interactivity: Improve user experience with advanced UI behaviors.
Flexibility & Customization: Tailor pages to fit unique business requirements.
Automation of Tasks: Execute repetitive operations efficiently.
Improved Efficiency: Handle front-end validations without waiting for round trips to the server.

#Essential JavaScript Functions for Oracle Apex
Here's a curated list of JavaScript functions that will come in handy while working with Oracle Apex, along with an explanation of what they do.
##1. Show a Loading Spinner
Adding a "spinner" improves user experience by visually indicating processing during AJAX calls or time-consuming tasks.
Function: This function displays a spinner overlay on a given element.
showSpinner(pObj) {
  var sp = document.createElement("div");
  sp.className = "loading-spinner";
  sp.textContent = "Loading…";
  pObj.appendChild(sp);
}
2. Remove a Spinner
When a process completes, it's equally important to remove the spinner.
Function: Removes the loader element from a specified object.
removeSpinner(pObj) {
  const oldSp = pObj.querySelector(".loading-spinner");
  if (oldSp) oldSp.remove();
}
3. Escape HTML Characters
This function ensures text displayed on web pages doesn't unintentionally execute harmful or invalid HTML.
Function Example:
function escapeHTML(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
4. Debounce Function Calls
Add a delay to repetitive calls of the same function, such as during user input or resizing.
Function:
debounce(fn, delay) {
  if (this.timer) clearTimeout(this.timer);
  this.timer = setTimeout(() => fn.apply(this, args), delay);
}
5. Alert Messages in Oracle Apex
This function triggers page success or error alerts to guide users.
Function Example:
alertMessages(pStatus, pMessage) {
    if (pStatus === "S") {
        apex.message.showPageSuccess(pMessage);
    } else if (pStatus === "E") {
        apex.message.showErrors([{ type: "error", location: "page", message: pMessage }]);
    }
}

Now, let's zoom in on a real-world application within Oracle Apex.
Example Use Case: Disabling Interactive Grid Row Selector
Interactive Grids in Oracle Apex are robust components for displaying and managing data on pages. However, there may be scenarios where you want to disable certain interactive features like the row selector.
Follow these steps to disable the interactive grid row selector.
1. Prepare the JavaScript Library
Start by adding the following JavaScript utility file (`apexUtils.js`) into your application's JavaScript file repository.
Snippet from `apexUtils.js`:
This includes our base structure for custom Apex utilities and contains essential helper functions.
Example partial file setup:
var apex = window.apex || {};
apex.custom = apex.custom || {};
apex.custom.utils = {
    debug: { log(errors) { console.log(errors); } },
    escapeHTML, // Utility functions added here.
};
2. Set Up the Interactive Grid Name
Find the exact static or dynamic ID of your interactive grid region. This makes targeting specific DOM selectors easier. Place unique identifiers using Static IDs within Page Designer. For example, set your interactive grid's ID to `empGrid`.
3. Add JavaScript Code to Disable Selector
Using the `apex.custom.utils` utility, include this JavaScript code under the "Execute When Page Loads" section or in the page initialization callback.
JavaScript Code Snippet:
document.addEventListener("DOMContentLoaded", function () {
    apex.custom.utils.debug.log("Interactive Grid Loading…");
    var grid$ = apex.region("empGrid").widget();
    grid$.interactiveGrid("option", {
        allowSingleRowSelection: false, // Disable checkbox selectors.
    });
});
4. Test the Behavior
Refresh your Oracle Apex app, open the target page, and confirm that the checkbox selectors for rows have been removed. The grid remains functional but restricted to your requirements.
Pro Tip
Consider wrapping interactive grid adjustments in conditionals to ensure compatibility across Apex versions. Debugging information logged via `console.log()` can also keep functionality checks easy.
Elevate Your Apex Pages with JavaScript
Adding JavaScript to Oracle Apex applications opens up a world of possibilities for customization, automation, and enhanced user interaction. Whether you're creating dynamic visual elements or simplifying processes with automation, understanding and leveraging JavaScript is key to building intuitive, high-performing applications.
Want more tips?
Bookmark our blog and subscribe to stay on top of JavaScript techniques for Oracle Apex.
JavaScript is your gateway to unlocking the full potential of Oracle Apex. Experiment with various functions, optimize your pages, and watch your applications come to life.
