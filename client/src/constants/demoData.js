export const demoProjects = [
  {
    _id: '1',
    name: 'Website Redesign',
    description: 'Complete overhaul of the company website with modern design, improved UX, and mobile responsiveness. Includes new content management system integration.',
    status: 'In Progress',
    progress: 65,
    color: 'blue',
    category: 'Design',
    isPublic: true,
    deadline: '2024-02-15',
    members: ['John Doe', 'Jane Smith'],
    createdAt: '2024-01-01'
  },
  {
    _id: '2',
    name: 'Mobile App Development',
    description: 'Building a cross-platform mobile application for iOS and Android using React Native. Features include user authentication, real-time updates, and offline capabilities.',
    status: 'Active',
    progress: 85,
    color: 'green',
    category: 'Development',
    isPublic: false,
    deadline: '2024-03-01',
    members: ['Mike Johnson', 'Sarah Wilson', 'Alex Brown'],
    createdAt: '2023-12-15'
  },
  {
    _id: '3',
    name: 'Marketing Campaign Q1',
    description: 'Quarterly marketing campaign focusing on social media, email marketing, and influencer partnerships. Goal is to increase brand awareness by 25%.',
    status: 'Completed',
    progress: 100,
    color: 'purple',
    category: 'Marketing',
    isPublic: true,
    deadline: '2024-01-31',
    members: ['Emily Davis', 'Tom Anderson'],
    createdAt: '2023-10-01'
  },
  {
    _id: '4',
    name: 'Data Migration Project',
    description: 'Migrating legacy database systems to cloud-based solutions. Includes data validation, testing, and user training for the new system.',
    status: 'Pending',
    progress: 15,
    color: 'orange',
    category: 'IT',
    isPublic: false,
    deadline: '2024-04-30',
    members: ['David Lee', 'Lisa Chen'],
    createdAt: '2024-01-15'
  },
  {
    _id: '5',
    name: 'Product Launch Event',
    description: 'Organizing a major product launch event with 500+ attendees. Includes venue selection, catering, marketing materials, and live streaming setup.',
    status: 'Overdue',
    progress: 45,
    color: 'red',
    category: 'Events',
    isPublic: true,
    deadline: '2024-01-20',
    members: ['Rachel Green', 'Chris Martin', 'Amy White'],
    createdAt: '2023-11-01'
  },
  {
    _id: '6',
    name: 'Customer Support Training',
    description: 'Comprehensive training program for customer support team covering new products, policies, and communication techniques. Includes certification process.',
    status: 'In Progress',
    progress: 70,
    color: 'teal',
    category: 'Training',
    isPublic: false,
    deadline: '2024-02-28',
    members: ['Kevin Taylor', 'Maria Garcia'],
    createdAt: '2024-01-10'
  }
];

export const demoStats = {
  totalProjects: 6,
  completed: 1,
  inProgress: 3,
  overdue: 1,
  pending: 1,
  totalMembers: 15,
  averageProgress: 63
};
