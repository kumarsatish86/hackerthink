'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import CommentsSection from '../../../components/comments/CommentsSection';

interface LabExercise {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  instructions: string;
  solution?: string;
  difficulty: string;
  duration: number;
  prerequisites?: string;
  featured_image?: string;
  author_name?: string;
  category?: string;
  helpful_resources?: Array<{ title: string; url: string }>;
  terminal_simulation?: { title?: string; commands?: string };
  related_exercises?: Array<{ title: string; slug: string }>;
  sidebar_settings?: Record<string, any>;
}

interface LabExerciseClientProps {
  exercise: LabExercise;
}

export default function LabExerciseClient({ exercise }: LabExerciseClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('content');
  const [showSolution, setShowSolution] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [similarExercises, setSimilarExercises] = useState<LabExercise[]>([]);
  
  // Progress tracking
  const [progress, setProgress] = useState(0);
  
  // References for scrolling
  const contentRef = useRef<HTMLDivElement>(null);
  const instructionsRef = useRef<HTMLDivElement>(null);
  
  // Animation trigger on scroll
  const [contentRefView, contentInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  // Parse instructions into steps
  const instructionSteps = exercise?.instructions?.split('\n\n').filter(step => step.trim() !== '') || [];
  
  // Function to track step completion
  const toggleStepCompletion = (stepIndex: number) => {
    if (completedSteps.includes(stepIndex)) {
      setCompletedSteps(completedSteps.filter(step => step !== stepIndex));
    } else {
      setCompletedSteps([...completedSteps, stepIndex]);
    }
  };
  
  // Update progress when completing steps
  useEffect(() => {
    if (instructionSteps.length > 0) {
      const newProgress = Math.round((completedSteps.length / instructionSteps.length) * 100);
      setProgress(newProgress);
    }
  }, [completedSteps, instructionSteps.length]);

  // Scroll functions for navigation
  const scrollToContent = () => {
    contentRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const scrollToInstructions = () => {
    instructionsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Format time for display
  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    }
    return `${hours} hour${hours > 1 ? 's' : ''} ${mins} min`;
  };
  
  // Get difficulty specific styling
  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-500';
      case 'intermediate':
        return 'bg-yellow-500';
      case 'advanced':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };
  
  const getDifficultyBadgeColor = (difficulty: string): string => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Fetch similar exercises based on difficulty and category
  const fetchSimilarExercises = async (currentId: string, difficulty: string) => {
    try {
      const response = await fetch(`/api/lab-exercises?difficulty=${difficulty}&limit=4`);
      
      if (response.ok) {
        const data = await response.json();
        // Filter out the current exercise and limit to 3
        const filtered = data.lab_exercises
          .filter((ex: LabExercise) => ex.id !== currentId)
          .slice(0, 3);
        
        setSimilarExercises(filtered);
      }
    } catch (err) {
      console.error('Error fetching similar exercises:', err);
    }
  };

  // Fetch similar exercises on mount
  useEffect(() => {
    fetchSimilarExercises(exercise.id, exercise.difficulty);
  }, [exercise.id, exercise.difficulty]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative">
        {/* Difficulty color indicator */}
        <div className={`absolute top-0 left-0 w-full h-1.5 ${getDifficultyColor(exercise.difficulty)}`}></div>
        
        <div className={`relative bg-gradient-to-r from-gray-900 to-gray-800 text-white overflow-hidden`}>
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{ 
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")',
              backgroundSize: '20px 20px'
            }}></div>
          </div>
          
          {/* Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
            <div className="md:flex md:items-start">
              <div className="flex-1">
                {/* Breadcrumb navigation */}
                <nav className="flex text-sm text-gray-300 mb-4" aria-label="Breadcrumb">
                  <ol className="flex items-center space-x-2">
                    <li>
                      <Link href="/" className="hover:text-white transition-colors">Home</Link>
                    </li>
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <Link href="/lab-exercises" className="hover:text-white transition-colors">Lab Exercises</Link>
                    </li>
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-white font-medium truncate">{exercise.title}</span>
                    </li>
                  </ol>
                </nav>
                
                {/* Title and description */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{exercise.title}</h1>
                  <p className="text-lg text-gray-300 max-w-3xl mb-6">{exercise.description}</p>
                  
                  <div className="flex flex-wrap gap-4 items-center mb-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDifficultyBadgeColor(exercise.difficulty)}`}>
                      {exercise.difficulty}
                    </span>
                    <span className="inline-flex items-center text-sm font-medium text-gray-300">
                      <svg className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatTime(exercise.duration)}
                    </span>
                  </div>
                  
                  {exercise.prerequisites && (
                    <div className="mb-8 max-w-4xl">
                      <div className="flex items-start text-sm font-medium text-gray-300">
                        <svg className="h-5 w-5 mr-3 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <div className="flex-1">
                          <span className="font-medium">Prerequisites:</span>
                          <div className="ml-1 mt-1">
                            {exercise.prerequisites.split('\n').map((line, index) => (
                              <div key={index} className="mb-1">
                                {line.trim()}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
                
                {/* Action buttons */}
                <div className="flex flex-wrap gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={scrollToContent}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg transition-colors"
                  >
                    Start Learning
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={scrollToInstructions}
                    className="px-6 py-3 bg-transparent border border-gray-300 hover:bg-gray-800 text-white font-medium rounded-lg shadow-lg transition-colors"
                  >
                    Jump to Instructions
                  </motion.button>
                </div>
              </div>
              
              {/* Progress indicator */}
              <div className="md:w-64 mt-8 md:mt-0 p-6 bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-sm rounded-xl">
                <div className="text-center">
                  <div className="flex justify-center items-center mb-4">
                    <svg className="w-12 h-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">Your Progress</h3>
                  <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
                    <div 
                      className="bg-blue-500 h-4 rounded-full transition-all duration-500 ease-in-out" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm">{progress}% Complete</p>
                  <div className="mt-4 text-sm">
                    <p>Completed: {completedSteps.length}/{instructionSteps.length} steps</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Lab Exercise Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:flex lg:gap-12">
          {/* Main content */}
          <div className="lg:w-2/3">
            {/* Tab navigation */}
            <div className="border-b border-gray-200 mb-8">
              <nav className="flex -mb-px space-x-8">
                <button
                  onClick={() => setActiveTab('content')}
                  className={`${
                    activeTab === 'content'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Overview & Content
                </button>
                <button
                  onClick={() => setActiveTab('instructions')}
                  className={`${
                    activeTab === 'instructions'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Step-by-Step Instructions
                </button>
              </nav>
            </div>
            
            {/* Tab content */}
            <AnimatePresence mode="wait">
              {activeTab === 'content' && (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="prose prose-lg max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: exercise.content }} />
                  </div>
                </motion.div>
              )}
              
              {activeTab === 'instructions' && (
                <motion.div
                  key="instructions"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-lg font-medium text-blue-800 mb-2">Instructions</h3>
                    <p className="text-gray-600">
                      Follow these steps to complete the lab exercise. Check the box next to each step as you complete it.
                    </p>
                  </div>
                  
                  <div className="space-y-6">
                    {instructionSteps.map((step, index) => (
                      <motion.div 
                        key={index}
                        className={`p-6 rounded-lg border ${
                          completedSteps.includes(index) ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                        } transition-colors duration-300`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <div className="flex">
                          <div className="flex-shrink-0 mr-4">
                            <div 
                              className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                completedSteps.includes(index) ? 'bg-green-500 text-white' : 'bg-blue-100 text-blue-600'
                              }`}
                            >
                              {completedSteps.includes(index) ? (
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <span>{index + 1}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex-grow">
                            <div className="flex items-start justify-between">
                              <div className="prose prose-lg max-w-none">
                                <div dangerouslySetInnerHTML={{ __html: step }} />
                              </div>
                              <div className="ml-4 flex-shrink-0">
                                <input
                                  type="checkbox"
                                  className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                                  checked={completedSteps.includes(index)}
                                  onChange={() => toggleStepCompletion(index)}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {exercise.solution && (
                    <div className="mt-12">
                      <div className="border-t border-gray-200 pt-6">
                        <button
                          onClick={() => setShowSolution(!showSolution)}
                          className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
                        >
                          <svg className={`h-5 w-5 mr-2 transition-transform duration-300 ${showSolution ? 'transform rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          {showSolution ? 'Hide Solution' : 'Show Solution'}
                        </button>
                        
                        <AnimatePresence>
                          {showSolution && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-4 p-6 bg-gray-50 rounded-lg border border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Solution</h3>
                                <div className="prose prose-lg max-w-none">
                                  <div dangerouslySetInnerHTML={{ __html: exercise.solution }} />
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Sidebar */}
          <div className="lg:w-1/3 mt-12 lg:mt-0">
            <div className="lg:sticky lg:top-6 space-y-8">
              {/* Resources Card */}
              {exercise.helpful_resources && exercise.helpful_resources.length > 0 && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl overflow-hidden shadow-md">
                  <div className="px-6 py-4 bg-blue-600 text-white">
                    <h3 className="text-lg font-medium">Helpful Resources</h3>
                  </div>
                  <div className="p-6">
                    <ul className="space-y-4">
                      {exercise.helpful_resources.map((resource, index) => (
                        <li key={index}>
                          <a 
                            href={resource.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <svg className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="font-medium">{resource.title}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              {/* Terminal Preview Card */}
              {exercise.terminal_simulation && (exercise.terminal_simulation.title || exercise.terminal_simulation.commands) && (
                <div className="bg-gray-900 rounded-xl overflow-hidden shadow-lg">
                  <div className="p-4 flex items-center border-b border-gray-800">
                    <div className="flex space-x-2 mr-4">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="text-gray-400 text-sm font-mono">
                      {exercise.terminal_simulation.title || 'Terminal'}
                    </div>
                  </div>
                  <div className="p-4 font-mono text-sm text-gray-300">
                    {exercise.terminal_simulation.commands ? (
                      exercise.terminal_simulation.commands.split('\n').map((line, index) => (
                        <p key={index} className={line.startsWith('$') ? 'text-green-400' : ''}>
                          {line || ' '}
                        </p>
                      ))
                    ) : (
                      <>
                        <p className="text-green-400">$ ls -la</p>
                        <p>total 32</p>
                        <p>drwxr-xr-x  5 user  staff  160 Mar 10 14:23 .</p>
                        <p>drwxr-xr-x  3 user  staff   96 Mar 10 14:22 ..</p>
                        <p>-rw-r--r--  1 user  staff  108 Mar 10 14:23 script.sh</p>
                        <p className="text-green-400">$ chmod +x script.sh</p>
                        <p className="text-green-400">$ ./script.sh</p>
                        <p>Hello, World!</p>
                        <p className="text-gray-400">_</p>
                      </>
                    )}
                  </div>
                </div>
              )}
              
              {/* Related Exercises Card */}
              {exercise.related_exercises && exercise.related_exercises.length > 0 && (
                <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100">
                  <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                    <h3 className="text-lg font-medium">Related Exercises</h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {exercise.related_exercises.map((relatedExercise, index) => (
                      <Link 
                        key={index}
                        href={`/lab-exercises/${relatedExercise.slug}`} 
                        className="block hover:bg-gray-50 transition-colors"
                      >
                        <div className="p-6">
                          <h4 className="text-base font-medium text-gray-900 mb-1">{relatedExercise.title}</h4>
                          <p className="text-sm text-gray-500 line-clamp-2">Click to explore this related exercise</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Completion Tracking */}
      <div className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Track Your Progress</h2>
            <div className="max-w-3xl mx-auto mb-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-between">
                  {[0, 1, 2, 3, 4].map((step) => {
                    const isCompleted = progress >= step * 25;
                    const isCurrent = progress >= step * 25 && progress < (step + 1) * 25;
                    
                    return (
                      <div key={step} className="flex flex-col items-center">
                        <div 
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            isCompleted ? 'bg-blue-600 text-white' : 'bg-white border-2 border-gray-300 text-gray-500'
                          } ${isCurrent ? 'ring-4 ring-blue-100' : ''}`}
                        >
                          {isCompleted ? (
                            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <span>{step + 1}</span>
                          )}
                        </div>
                        <div className="text-xs mt-2">
                          {step === 0 && "Start"}
                          {step === 1 && "25%"}
                          {step === 2 && "50%"}
                          {step === 3 && "75%"}
                          {step === 4 && "Complete!"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Link 
                href="/lab-exercises"
                className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-4"
              >
                Back to All Exercises
              </Link>
              {progress === 100 ? (
                <Link
                  href="/certificate"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Mark as Complete
                </Link>
              ) : (
                <button
                  onClick={() => {
                    // Mark all steps as completed
                    const allSteps = Array.from({ length: instructionSteps.length }, (_, i) => i);
                    setCompletedSteps(allSteps);
                  }}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Complete All Steps
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Similar Lab Exercises Section */}
      <div className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Similar Lab Exercises</h2>
            <p className="mt-4 text-xl text-gray-600">Continue your learning journey with these related labs</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {similarExercises.length > 0 ? (
              similarExercises.map((exercise) => (
                <Link href={`/lab-exercises/${exercise.slug}`} key={exercise.id}>
                  <div className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col transition-transform duration-300 hover:transform hover:scale-105 hover:shadow-lg">
                    {exercise.featured_image ? (
                      <div className="h-48 bg-gray-200 relative overflow-hidden">
                        <img 
                          src={exercise.featured_image} 
                          alt={exercise.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                        <svg className="w-16 h-16 text-white opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="p-6 flex-grow">
                      <div className="flex items-center mb-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyBadgeColor(exercise.difficulty)}`}>
                          {exercise.difficulty}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">{exercise.duration} min</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{exercise.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-3">{exercise.description}</p>
                    </div>
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <span className="text-blue-600 font-medium text-sm flex items-center">
                        Explore Lab
                        <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No similar exercises found</h3>
                <p className="mt-2 text-gray-500">Check back later for more exercises related to this topic.</p>
              </div>
            )}
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/lab-exercises" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              View All Lab Exercises
            </Link>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Comments & Discussion</h2>
            <CommentsSection contentId={exercise.id} contentType="lab-exercise" />
          </div>
        </div>
      </div>
      
      {/* Subscription Form Section */}
      <div className="border-t border-gray-200 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Stay Updated with New Lab Exercises</h2>
            <p className="text-lg opacity-90">Subscribe to our newsletter to receive notifications about new lab exercises, tutorials, and learning resources.</p>
          </div>
          
          <div className="max-w-xl mx-auto">
            <form className="sm:flex">
              <div className="min-w-0 flex-1">
                <label htmlFor="email" className="sr-only">Email address</label>
                <input 
                  id="email" 
                  type="email" 
                  placeholder="Enter your email address" 
                  className="block w-full px-4 py-3 rounded-md border-0 text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
                />
              </div>
              <div className="mt-3 sm:mt-0 sm:ml-3">
                <button 
                  type="submit"
                  className="block w-full rounded-md border border-transparent px-4 py-3 bg-indigo-800 text-base font-medium text-white shadow hover:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 sm:px-8"
                >
                  Subscribe
                </button>
              </div>
            </form>
            <p className="mt-3 text-sm opacity-75 text-center">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
          
          <div className="mt-12 flex justify-center space-x-6">
            <a href="#" className="text-white hover:text-blue-100">
              <span className="sr-only">Facebook</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="#" className="text-white hover:text-blue-100">
              <span className="sr-only">Twitter</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            <a href="#" className="text-white hover:text-blue-100">
              <span className="sr-only">YouTube</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
