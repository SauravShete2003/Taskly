# Test Utilities and Helper Functions

## Mock Data Generators

### Task Mock Data
```javascript
// test-utils/mockData.js
export const generateMockTask = (overrides = {}) => ({
  _id: overrides._id || `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  title: overrides.title || 'Test Task',
  description: overrides.description || 'Test task description',
  priority: overrides.priority || 'medium',
  dueDate: overrides.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  status: overrides.status || 'todo',
  board: overrides.board || 'board_123',
  createdBy: overrides.createdBy || 'user_123',
  assignees: overrides.assignees || [],
  comments: overrides.comments || [],
  createdAt: overrides.createdAt || new Date().toISOString(),
  updatedAt: overrides.updatedAt || new Date().toISOString(),
});

export const generateMockComment = (overrides = {}) => ({
  _id: overrides._id || `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  content: overrides.content || 'Test comment content',
  user: overrides.user || 'user_123',
  createdAt: overrides.createdAt || new Date().toISOString(),
});

export const generateMockUser = (overrides = {}) => ({
  _id: overrides._id || 'user_123',
  name: overrides.name || 'Test User',
  email: overrides.email || 'test@example.com',
  avatar: overrides.avatar || null,
});
```

## API Mock Utilities

### Mock Task Service
```javascript
// test-utils/mockTaskService.js
import { generateMockTask, generateMockComment } from './mockData';

export const mockTaskService = {
  createTask: jest.fn().mockResolvedValue({
    task: generateMockTask()
  }),
  
  getTaskById: jest.fn().mockResolvedValue({
    task: generateMockTask()
  }),
  
  updateTask: jest.fn().mockResolvedValue({
    task: generateMockTask()
  }),
  
  addComment: jest.fn().mockResolvedValue({
    comment: generateMockComment()
  }),
  
  removeComment: jest.fn().mockResolvedValue({}),
  
  // Error versions
  createTaskError: jest.fn().mockRejectedValue(new Error('Failed to create task')),
  getTaskByIdError: jest.fn().mockRejectedValue(new Error('Task not found')),
};
```

## Test Setup Utilities

### Test Wrapper Component
```javascript
// test-utils/testWrapper.jsx
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { NotificationProvider } from '../src/contexts/NotificationContext';

export const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <NotificationProvider>
      {children}
    </NotificationProvider>
  </BrowserRouter>
);
```

### Mock Local Storage
```javascript
// test-utils/mockLocalStorage.js
export const mockLocalStorage = () => {
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
  
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
  
  return localStorageMock;
};
```

## Custom Test Matchers

### API Call Matchers
```javascript
// test-utils/customMatchers.js
expect.extend({
  toHaveBeenCalledWithTaskData(received, expectedData) {
    const calls = received.mock.calls;
    const lastCall = calls[calls.length - 1];
    
    if (!lastCall) {
      return {
        pass: false,
        message: () => 'API was not called',
      };
    }
    
    const [boardId, taskData] = lastCall;
    const matches = Object.keys(expectedData).every(key => 
      taskData[key] === expectedData[key]
    );
    
    return {
      pass: matches,
      message: () => `Expected task data to match, but got ${JSON.stringify(taskData)}`,
    };
  },
});
```

## Test Data for Manual Testing

### Sample Test Cases
```javascript
// test-data/sampleTestCases.js
export const SAMPLE_TASK_CREATION_DATA = [
  {
    name: 'Minimal Task',
    data: { title: 'Minimal Test Task' },
    description: 'Task with only required title field'
  },
  {
    name: 'Full Task',
    data: {
      title: 'Complete Test Task',
      description: 'This is a complete test task with all fields filled',
      priority: 'high',
      dueDate: '2024-12-31'
    },
    description: 'Task with all optional fields'
  },
  {
    name: 'High Priority Task',
    data: {
      title: 'Urgent Task',
      priority: 'urgent',
      dueDate: '2024-01-15'
    },
    description: 'High priority task with near deadline'
  }
];

export const SAMPLE_COMMENT_DATA = [
  {
    content: 'This is a test comment',
    description: 'Simple text comment'
  },
  {
    content: 'Comment with special characters: !@#$%^&*()',
    description: 'Comment with special characters'
  },
  {
    content: 'Long comment '.repeat(20),
    description: 'Long comment text'
  }
];
```

## Debug Utilities

### API Call Logger
```javascript
// test-utils/debugHelpers.js
export const logApiCalls = () => {
  const originalFetch = window.fetch;
  
  window.fetch = async (...args) => {
    console.log('API Call:', args[0], args[1]?.method || 'GET');
    const response = await originalFetch(...args);
    console.log('API Response:', response.status, response.statusText);
    return response;
  };
  
  return () => {
    window.fetch = originalFetch;
  };
};

export const logComponentRenders = (componentName) => {
  let renderCount = 0;
  
  return {
    logRender: () => {
      renderCount++;
      console.log(`${componentName} rendered: ${renderCount}`);
    },
    getCount: () => renderCount
  };
};
```

## Performance Testing

### Load Test Utilities
```javascript
// test-utils/performanceTest.js
export const measureLoadTime = async (action, iterations = 10) => {
  const times = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await action();
    const end = performance.now();
    times.push(end - start);
  }
  
  const average = times.reduce((sum, time) => sum + time, 0) / times.length;
  const max = Math.max(...times);
  const min = Math.min(...times);
  
  return { average, max, min, times };
};

export const simulateNetworkConditions = (latency = 100, successRate = 1.0) => {
  const originalFetch = window.fetch;
  
  window.fetch = async (...args) => {
    await new Promise(resolve => setTimeout(resolve, latency));
    
    if (Math.random() > successRate) {
      throw new Error('Simulated network failure');
    }
    
    return originalFetch(...args);
  };
  
  return () => {
    window.fetch = originalFetch;
  };
};
```

## Usage Examples

### Basic Test Setup
```javascript
import { render, screen } from '@testing-library/react';
import { TestWrapper, mockLocalStorage } from '../test-utils';
import TaskCreatePage from '../src/pages/TaskCreatePage';

describe('TaskCreatePage', () => {
  beforeEach(() => {
    mockLocalStorage();
    localStorage.getItem.mockReturnValue('mock-token');
  });
  
  it('renders task creation form', () => {
    render(
      <TestWrapper>
        <TaskCreatePage />
      </TestWrapper>
    );
    
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });
});
```

### API Mocking Example
```javascript
import { mockTaskService } from '../test-utils/mockTaskService';

jest.mock('../src/services/tasks', () => mockTaskService);

describe('Task Creation', () => {
  it('calls createTask with correct data', async () => {
    // Test implementation
    expect(mockTaskService.createTask).toHaveBeenCalledWithTaskData({
      title: 'Test Task',
      priority: 'medium'
    });
  });
});
