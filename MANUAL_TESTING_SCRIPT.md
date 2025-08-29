# Manual Testing Script - Task Creation & Detail Pages

## Prerequisites
1. Ensure the backend server is running on `http://localhost:5000`
2. Ensure the frontend development server is running
3. Have a valid user account and be logged in
4. Have at least one board created to test task creation

## Test 1: TaskCreatePage - Basic Functionality

### 1.1 Form Rendering
**Steps:**
1. Navigate to `/boards/{boardId}/create-task` (replace {boardId} with actual board ID)
2. Verify the page loads without errors
3. Verify "Back to board" link is present and functional
4. Verify form contains:
   - Title input field (required)
   - Description textarea
   - Priority dropdown with options: low, medium, high, urgent
   - Due date date picker
   - Save button

**Expected Results:**
- Page loads successfully
- All form fields are visible and accessible
- "Back to board" link navigates to board tasks page

### 1.2 Form Validation
**Steps:**
1. Leave title field empty
2. Click Save button
3. Try to submit form with only spaces in title
4. Submit form with valid title

**Expected Results:**
- Alert shows "Title is required" when title is empty
- Form does not submit with invalid data
- Form submits successfully with valid title

## Test 2: Task Creation - Success Scenarios

### 2.1 Create Task with Minimum Data
**Steps:**
1. Fill only the title field: "Test Task - Minimum"
2. Click Save
3. Monitor network requests in browser dev tools
4. Observe notifications and navigation

**Expected Results:**
- API call to `POST /api/tasks/board/{boardId}` with correct payload
- Success notification: "Task created successfully!"
- Navigation to `/tasks/{newTaskId}`
- Task detail page loads with correct data

### 2.2 Create Task with All Fields
**Steps:**
1. Fill all form fields:
   - Title: "Test Task - Complete"
   - Description: "This is a complete test task description"
   - Priority: "high"
   - Due Date: Select a future date
2. Click Save
3. Monitor network requests

**Expected Results:**
- API call includes all form data
- Success notification appears
- Navigation to task detail page
- All data displayed correctly on detail page

## Test 3: Task Creation - Error Scenarios

### 3.1 Network Error
**Steps:**
1. Open browser dev tools → Network tab
2. Set network throttling to "Offline"
3. Fill form and click Save
4. Restore network connection

**Expected Results:**
- Error notification: "Failed to create task"
- Form remains accessible
- No navigation occurs

### 3.2 Server Error
**Steps:**
1. Temporarily stop backend server
2. Fill form and click Save
3. Restart server

**Expected Results:**
- Error notification with server error message
- Form remains accessible

## Test 4: TaskDetailPage - Loading & Display

### 4.1 Successful Loading
**Steps:**
1. Navigate to an existing task: `/tasks/{taskId}`
2. Observe loading state
3. Verify task data displays correctly

**Expected Results:**
- "Loading..." message appears briefly
- Task title, description, priority, due date displayed
- Edit button visible
- Comments section present

### 4.2 Error States
**Steps:**
1. Navigate to non-existent task: `/tasks/invalid-id`
2. Navigate to task you don't have access to

**Expected Results:**
- Appropriate error message displayed
- Page remains usable (not crashed)

## Test 5: Task Editing

### 5.1 Enter Edit Mode
**Steps:**
1. On task detail page, click "Edit" button
2. Verify form appears with current values
3. Verify "Cancel" button appears

**Expected Results:**
- TaskForm replaces display view
- All current values populated in form
- Cancel button functional

### 5.2 Save Edits
**Steps:**
1. Modify some fields (e.g., change priority, update description)
2. Click Save in the form
3. Monitor network requests

**Expected Results:**
- API call to `PUT /api/tasks/{taskId}`
- Success notification: "Task updated successfully!"
- Returns to display view with updated data

### 5.3 Cancel Editing
**Steps:**
1. Make changes in edit mode
2. Click Cancel instead of Save
3. Verify original data preserved

**Expected Results:**
- Returns to display view
- Original data unchanged
- No API calls made

## Test 6: Comments Functionality

### 6.1 Add Comment
**Steps:**
1. In comment section, type a test comment
2. Click submit/Add button
3. Monitor network requests

**Expected Results:**
- API call to `POST /api/tasks/{taskId}/comments`
- Success notification: "Comment added successfully!"
- Comment appears in comments list
- Comment shows author info and timestamp

### 6.2 Remove Comment
**Steps:**
1. Find a comment you added
2. Click remove/delete button (if available)
3. Confirm deletion if prompted

**Expected Results:**
- API call to `DELETE /api/tasks/{taskId}/comments/{commentId}`
- Success notification: "Comment removed successfully!"
- Comment removed from list

### 6.3 Comment Error Handling
**Steps:**
1. Try to add empty comment
2. Try to remove comment you don't own (if possible)

**Expected Results:**
- Appropriate error messages
- No unwanted API calls

## Test 7: Integration Testing

### 7.1 Full Create → View Flow
**Steps:**
1. Create a new task with specific data
2. Verify navigation to detail page
3. Verify all data matches what was created
4. Edit the task
5. Verify updates persist

**Expected Results:**
- Seamless flow from creation to viewing
- Data consistency throughout
- All operations work as expected

### 7.2 Browser Navigation
**Steps:**
1. Use browser back/forward buttons during flows
2. Refresh pages at various stages

**Expected Results:**
- Navigation works correctly
- Data persists through refreshes
- No broken states

## Test 8: Console Monitoring

### 8.1 Error Checking
**Steps:**
1. Open browser console before starting tests
2. Perform all test scenarios
3. Watch for any JavaScript errors or warnings

**Expected Results:**
- No console errors
- Minimal warnings (if any)
- Clean console output

## Test 9: Performance & UX

### 9.1 Loading Times
**Steps:**
1. Note time from form submission to navigation
2. Note time from page load to content display

**Expected Results:**
- Acceptable loading times (<2-3 seconds)
- No excessive waiting

### 9.2 Responsive Design
**Steps:**
1. Test on different screen sizes
2. Test on mobile devices (if available)

**Expected Results:**
- Layout remains usable
- No overlapping elements
- Touch targets appropriately sized

## Test Results Tracking

Use this table to track your test results:

| Test Case | Status | Notes |
|-----------|--------|-------|
| 1.1 Form Rendering | | |
| 1.2 Form Validation | | |
| 2.1 Min Data Creation | | |
| 2.2 Full Data Creation | | |
| 3.1 Network Error | | |
| 3.2 Server Error | | |
| 4.1 Successful Loading | | |
| 4.2 Error States | | |
| 5.1 Enter Edit Mode | | |
| 5.2 Save Edits | | |
| 5.3 Cancel Editing | | |
| 6.1 Add Comment | | |
| 6.2 Remove Comment | | |
| 6.3 Comment Errors | | |
| 7.1 Full Flow | | |
| 7.2 Browser Nav | | |
| 8.1 Console Errors | | |
| 9.1 Loading Times | | |
| 9.2 Responsive | | |

## Troubleshooting

**Common Issues:**
- CORS errors: Check backend CORS configuration
- Authentication errors: Verify token is valid
- Network errors: Check server is running
- Data not saving: Check MongoDB connection

**Debug Tips:**
- Use browser dev tools Network tab to monitor API calls
- Check console for error messages
- Verify response data structure matches expectations
