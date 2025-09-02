# Taskly - Modern Project Management Dashboard

A professional, responsive SaaS-style project management dashboard built with React, Tailwind CSS, and modern design principles.

## ✨ Features

### 🎨 Modern Design
- **Clean, minimal layout** with soft colors and elegant typography
- **Professional SaaS aesthetic** inspired by Trello, Asana, and Notion
- **Rounded corners, subtle shadows, and smooth hover animations**
- **Inter and Poppins fonts** for optimal readability

### 🌓 Dark Mode Support
- **Smooth dark mode transitions** with system preference detection
- **Persistent dark mode preference** stored in localStorage
- **Consistent color scheme** across all components

### 📱 Fully Responsive
- **Mobile-first design** with responsive grid layouts
- **Hamburger menu** for mobile navigation
- **Grid collapses to single column** on small screens
- **Touch-friendly interface** with proper spacing

### 🚀 Dashboard Features
- **Sticky header** with logo, navigation, and user profile
- **Optional sidebar** with icon-based navigation
- **Key statistics cards** showing project metrics
- **Projects grid** with hover effects and status badges
- **Search and filtering** capabilities
- **Grid/List view toggle** for different viewing preferences

### 🎯 Project Management
- **Project cards** with color indicators and progress bars
- **Status badges** (Active, Completed, Pending, Overdue)
- **Member count display** and project visibility settings
- **Progress tracking** with visual progress bars
- **Deadline management** and overdue detection

### 🎨 UI Components
- **Consistent button themes** (Primary, Secondary, Danger, Ghost)
- **Beautiful empty states** with illustrations and call-to-action
- **Loading skeletons** for better perceived performance
- **Smooth animations** and micro-interactions
- **Professional color palette** with semantic color usage

## 🛠️ Technology Stack

- **Frontend**: React 19, React Router DOM
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React (modern, consistent icon set)
- **State Management**: React Hooks
- **Build Tool**: Create React App with custom webpack config

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Taskly
   ```

2. **Install dependencies**
   ```bash
   cd client
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
client/src/
├── components/          # Reusable UI components
│   ├── Layout/         # Layout components (Header, Sidebar)
│   ├── StatisticsCard.js # Dashboard statistics display
│   ├── ProjectCard.js  # Individual project cards
│   └── EmptyState.js   # Empty state illustrations
├── pages/              # Page components
│   └── Dashboard.js    # Main dashboard page
├── constants/          # Constants and demo data
│   └── demoData.js     # Sample projects for demonstration
├── services/           # API services
└── App.css            # Global styles and utilities
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3B82F6) - Main actions and highlights
- **Success**: Green (#10B981) - Completed tasks and positive states
- **Warning**: Orange (#F59E0B) - In-progress and pending states
- **Danger**: Red (#EF4444) - Errors and overdue items
- **Neutral**: Gray scale for text and backgrounds

### Typography
- **Headings**: Poppins (Bold, Semi-bold)
- **Body**: Inter (Regular, Medium)
- **Hierarchy**: Clear size scale (3xl, 2xl, xl, lg, base, sm, xs)

### Spacing & Layout
- **Consistent spacing** using Tailwind's spacing scale
- **Card-based layout** with proper padding and margins
- **Grid system** that adapts to different screen sizes
- **White space** for improved readability and visual hierarchy

## 🔧 Customization

### Adding New Components
1. Create component in `src/components/`
2. Follow the established naming conventions
3. Use the design system colors and spacing
4. Include proper TypeScript types if applicable

### Modifying Styles
- **Global styles**: Edit `src/App.css`
- **Component styles**: Use Tailwind classes or component-specific CSS
- **Theme customization**: Modify `tailwind.config.js`

### Adding New Routes
1. Add route in `src/App.js`
2. Create corresponding page component
3. Update navigation in Header and Sidebar components

## 📱 Responsive Breakpoints

- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (sm to lg)
- **Desktop**: > 1024px (lg+)

## 🌟 Key Features in Detail

### Statistics Cards
- **Real-time metrics** with change indicators
- **Color-coded icons** for visual hierarchy
- **Hover effects** and smooth transitions
- **Loading states** for better UX

### Project Grid
- **Flexible layout** that adapts to content
- **Status-based filtering** and search
- **Progress visualization** with color-coded bars
- **Member count** and project visibility indicators

### Navigation
- **Sticky header** with search and user menu
- **Collapsible sidebar** with smooth animations
- **Active route highlighting** for better UX
- **Mobile-optimized** navigation patterns

## 🎯 Best Practices

### Performance
- **Lazy loading** for components and routes
- **Optimized images** and assets
- **Efficient state management** with React hooks
- **Minimal re-renders** with proper dependency arrays

### Accessibility
- **Semantic HTML** structure
- **Proper ARIA labels** and roles
- **Keyboard navigation** support
- **Color contrast** compliance

### Code Quality
- **Consistent naming** conventions
- **Component composition** for reusability
- **Proper error handling** and loading states
- **Clean, readable code** with comments

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables
Create `.env` file in the client directory:
```env
REACT_APP_API_URL=your_api_url_here
REACT_APP_ENV=production
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following the design system
4. Test thoroughly on different devices
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Design inspiration**: Trello, Asana, Notion
- **Icons**: Lucide React
- **Styling**: Tailwind CSS
- **UI patterns**: Modern SaaS applications

---

Built with ❤️ for modern project management needs.
