# Quick Start - Task Testing Guide

## 🚀 Getting Started in 5 Minutes

### 1. Prerequisites Setup
```bash
# Start backend server
cd server
npm start

# Start frontend (in new terminal)
cd client
npm start
```

### 2. Login & Prepare
1. Open http://localhost:3000
2. Login with test account
3. Create a test board if none exists
4. Note the board ID from URL: `/boards/{boardId}/tasks`

### 3. Quick Test Sequence

#### Test 1: Basic Task Creation
1. Navigate to: `http://localhost:3000/boards/{boardId}/create-task`
2. Fill only title: "Quick Test Task"
3. Click Save
4. Verify: Success notification + navigation to task detail

#### Test 2: Task Details
1. On task detail page, verify:
   - Title displays correctly
   - Edit button works
   - Comments section visible

#### Test 3: Add Comment
1. Type test comment in comment box
2. Click Add
3. Verify: Comment appears + success notification

### 4. Monitor Console
Keep browser console open to catch any errors during testing.

## 🔧 Common Test Scenarios

### Happy Path Testing
```javascript
// Sequence: Create → View → Edit → Comment
1. Create task with all fields
2. Verify data on detail page  
3. Edit task (change priority/description)
4. Add multiple comments
5. Remove one comment
```

### Error Scenario Testing
```javascript
// Test error handling
1. Create task without title (should show alert)
2. Go offline and try to create task
3. Navigate to invalid task ID
```

## 📊 Quick Performance Check

### Load Times
- Task creation: Should be < 1 second
- Task loading: Should be < 500ms  
- Comments: Should be < 300ms

### Responsive Check
- Resize browser to mobile size
- Verify form remains usable
- Check touch target sizes

## 🐛 Quick Debug Tips

### If API Calls Fail
1. Check server is running on port 5000
2. Verify CORS configuration
3. Check authentication token

### If Navigation Fails  
1. Verify React Router setup
2. Check task ID format in URLs

### If Data Doesn't Persist
1. Check MongoDB connection
2. Verify API response structure

## 📋 Quick Checklist

### Must-Have Tests
- [ ] Create task with title only
- [ ] Create task with all fields
- [ ] Edit existing task
- [ ] Add comment to task
- [ ] Handle network errors gracefully

### Nice-to-Have Tests
- [ ] Test with different priorities
- [ ] Test with past/future due dates
- [ ] Test multiple comments
- [ ] Test responsive design

## 🎯 Test Priorities

### Critical (Test First)
1. Task creation basic functionality
2. Error handling for network issues
3. Data persistence verification

### Important (Test Next)  
1. Task editing functionality
2. Comments functionality
3. Navigation flows

### Optional (Test Last)
1. Performance optimization
2. Edge cases
3. Cross-browser testing

## 📝 Quick Reporting

### For Each Test
- [ ] Test case description
- [ ] ✅ Pass / ❌ Fail
- [ ] Screenshot if failed
- [ ] Console errors if any

### Common Issues to Document
- API response structure mismatches
- Navigation problems  
- UI rendering issues
- Performance bottlenecks

## 🆘 Troubleshooting

### Server Not Starting
```bash
# Check dependencies
npm install

# Check port 5000 not in use
netstat -ano | findstr :5000
```

### Frontend Not Starting
```bash
# Clear cache
npm start -- --reset-cache

# Check node_modules
rm -rf node_modules && npm install
```

### Database Issues
- Check MongoDB connection string
- Verify database exists and accessible

## ✅ Completion Criteria

Testing is complete when:
- All critical test cases pass
- No JavaScript errors in console
- All user flows work end-to-end
- Error handling works for common scenarios
- Performance is acceptable

---

**Ready to start testing!** 🎉

Use the detailed testing scripts for comprehensive coverage, or follow this quick guide for a basic smoke test.
