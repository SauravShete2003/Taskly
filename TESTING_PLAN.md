# Task Creation and Detail Testing Plan

## Overview
This document outlines the testing strategy for the TaskCreatePage and TaskDetailPage components, including their integration with backend services.

## Test Environment
- Frontend: React application
- Backend: Node.js/Express API
- Database: MongoDB
- Authentication: JWT tokens

## Test Scenarios

### 1. TaskCreatePage Testing

#### 1.1 Form Rendering
- [ ] Verify TaskForm renders with all required fields (title, description, priority, dueDate)
- [ ] Verify form validation (title is required)
- [ ] Verify default values are set correctly
- [ ] Verify form submission button is present

#### 1.2 Task Creation - Success Cases
- [ ] Create task with minimal required fields (title only)
- [ ] Create task with all optional fields
- [ ] Verify API call is made with correct payload
- [ ] Verify success notification is shown
- [ ] Verify navigation to TaskDetailPage after successful creation
- [ ] Verify created task data is displayed correctly on detail page

#### 1.3 Task Creation - Error Cases
- [ ] Attempt to create task without title (should show validation error)
- [ ] Simulate API failure (network error, server error)
- [ ] Verify error notification is shown
- [ ] Verify form remains accessible after error

#### 1.4 Navigation
- [ ] Verify "Back to board" link works correctly
- [ ] Verify navigation preserves board context

### 2. TaskDetailPage Testing

#### 2.1 Task Loading
- [ ] Verify loading state is shown while fetching task
- [ ] Verify task data is displayed correctly after loading
- [ ] Verify error state is shown when task not found
- [ ] Verify error state is shown when access denied

#### 2.2 Task Display
- [ ] Verify all task fields are displayed correctly
- [ ] Verify priority and status labels are properly formatted
- [ ] Verify due date formatting
- [ ] Verify assignees display
- [ ] Verify comments section is present

#### 2.3 Task Editing
- [ ] Verify edit mode can be toggled
- [ ] Verify TaskForm is populated with current values in edit mode
- [ ] Verify task update API call is made with correct payload
- [ ] Verify success notification on update
- [ ] Verify task data is refreshed after update

#### 2.4 Comments Functionality
- [ ] Verify comment input is present and functional
- [ ] Verify adding comment makes API call
- [ ] Verify comment appears in list after successful addition
- [ ] Verify success notification for comment addition
- [ ] Verify comment removal functionality
- [ ] Verify success notification for comment removal
- [ ] Verify only comment author or admin can remove comments

#### 2.5 Error Handling
- [ ] Verify error notifications for failed operations
- [ ] Verify UI remains functional after errors

### 3. Integration Testing

#### 3.1 Create → View Flow
- [ ] Create a new task and verify it appears correctly on detail page
- [ ] Verify all created data is persisted and displayed

#### 3.2 Edit → View Flow
- [ ] Edit task details and verify changes are reflected
- [ ] Verify navigation back to detail view works correctly

#### 3.3 Comment Flow
- [ ] Add comment and verify it persists
- [ ] Remove comment and verify it's removed

### 4. API Integration Testing

#### 4.1 TaskService Methods
- [ ] Verify createTask method handles both response structures
- [ ] Verify getTaskById method handles errors
- [ ] Verify updateTask method works correctly
- [ ] Verify addComment and removeComment methods

#### 4.2 Error Scenarios
- [ ] Test with invalid task IDs
- [ ] Test with unauthorized access
- [ ] Test with network timeouts

### 5. UI/UX Testing

#### 5.1 Responsiveness
- [ ] Verify layout on different screen sizes
- [ ] Verify form usability on mobile devices

#### 5.2 Accessibility
- [ ] Verify proper form labels and ARIA attributes
- [ ] Verify keyboard navigation
- [ ] Verify screen reader compatibility

#### 5.3 Performance
- [ ] Verify loading times are acceptable
- [ ] Verify no memory leaks in component lifecycle

## Test Data

### Sample Task Data
```json
{
  "title": "Test Task",
  "description": "This is a test task description",
  "priority": "high",
  "dueDate": "2024-12-31"
}
```

### Sample Comment Data
```json
{
  "content": "This is a test comment"
}
```

## Test Tools & Setup

### Manual Testing
- Browser developer tools for network monitoring
- Console logging for debugging
- Postman/Insomnia for API testing

### Automated Testing (Future)
- Jest for unit tests
- React Testing Library for component tests
- Cypress for E2E tests

## Success Criteria
- All form validations work correctly
- API calls are made with correct endpoints and payloads
- Notifications are displayed appropriately
- Navigation works as expected
- Error states are handled gracefully
- Data consistency is maintained across operations
