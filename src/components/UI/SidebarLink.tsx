import { Link } from "react-router-dom";

interface Props {
    item: {
        name: string;
        href: string;
        icon: React.ComponentType<any>;
        show: boolean;
    },
    isActive: boolean,
    sidebarStatus: React.Dispatch<React.SetStateAction<boolean>>;
}
export default function SidebarLink(props: Props) {
    const { item, isActive, sidebarStatus } = props;
    return (
        <Link
            onClick={() => sidebarStatus(false)}
            key={item.name}
            to={item.href}
            className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 
                  ${isActive
                    ? 'bg-secundario fuente-clara border border-blue-200 shadow-sm'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
        >
            <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${isActive ? 'fuente-clara' : 'text-gray-400 group-hover:text-gray-600'
                }`} />
            {item.name}
        </Link >
    )
}
