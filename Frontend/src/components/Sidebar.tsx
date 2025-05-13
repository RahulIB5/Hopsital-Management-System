import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  UserRound,
  Menu,
  X,
} from 'lucide-react';
import { useEffect, useRef } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Appointments', href: '/appointments', icon: Calendar },
  { name: 'Doctors', href: '/doctors', icon: Users },
  { name: 'Patients', href: '/patients', icon: UserRound },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const location = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('Sidebar isOpen state:', isOpen);
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        console.log('Clicked outside sidebar, closing mobile menu');
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  return (
    <>
      <div
        ref={sidebarRef}
        className={`fixed inset-y-0 z-50 flex flex-col transition-transform duration-300 ease-in-out bg-white shadow-lg border-r border-gray-200 ${
          isOpen ? 'translate-x-0 w-72' : '-translate-x-full w-0'
        } overflow-y-auto`}
      >
        <div className="flex grow flex-col gap-y-5 px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center justify-between">
            <span className="text-xl font-bold text-gray-900">Medical Dashboard</span>
            <button
              type="button"
              className="-m-2.5 p-2.5 text-gray-700 hover:text-blue-600 transition-colors duration-300 ease-in-out"
              onClick={() => {
                console.log('Closing mobile menu via close button');
                setIsOpen(false);
              }}
            >
              <span className="sr-only">Close sidebar</span>
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          className={`
                            group flex gap-x-3 rounded-md p-2 text-sm leading-6
                            ${
                              isActive
                                ? 'bg-gray-50 text-blue-600'
                                : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                            } transition-all duration-300 ease-in-out transform hover:scale-105`
                          }
                          onClick={() => {
                            console.log(`Navigating to ${item.href}, closing mobile menu`);
                            setIsOpen(false);
                          }}
                        >
                          <Icon
                            className={`h-6 w-6 shrink-0 ${
                              isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'
                            } transition-colors duration-300 ease-in-out`}
                            aria-hidden="true"
                          />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out"
          onClick={() => {
            console.log('Clicked overlay, closing mobile menu');
            setIsOpen(false);
          }}
        />
      )}
    </>
  );
}