import { ReactNode } from 'react';

interface Props {
    children: ReactNode;
    title: string;
    total: number;
}

const SummaryCard: React.FC<Props> = ({ children, title, total }) => {

    //ACA IRIA LA LOGICA DEL SUMMARY CARD
    return (
        // ACA IRIA LA INTERFAZ DEL SUMMARY CARD
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
                <div className="flex-shrink-0">
                    {children}
                </div>
                <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                    <p className="text-2xl font-bold text-gray-900">{total}</p>
                </div>
            </div>
        </div>
    )
}

export default SummaryCard;

