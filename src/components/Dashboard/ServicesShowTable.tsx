import React from 'react'
import { Service } from '../../types';
import { formatPrice } from '../Utils';
import { CalendarCog, SquareScissors } from 'lucide-react';

interface ServicesShowTableProps {
    services: Service[];
}
export default function ServicesShowTable({ services }: ServicesShowTableProps) {
    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
                <div className="px-6 py-2 text-start bg-principal w-full fuente-clara">
                    <h1 className="flex gap-2"><SquareScissors /> Servicios activos</h1>
                </div>
                <table className="bg-principal min-w-full divide-y divide-gray-200">
                    <tbody className="bg-white divide-y divide-gray-200">
                        {services.map((svc) => (
                            svc.isActive &&
                            <tr key={svc.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {svc.name}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {svc.durationMin} min
                                </td>
                                <td className="px-6 py-4 text-end whitespace-nowrap text-sm text-gray-500">
                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-principal fuente-clara w-fit">
                                        {formatPrice(Number(svc.price)).slice(0, svc.price.length)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {services.length === 0 && (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="px-6 py-4 text-center text-sm text-gray-500"
                                >
                                    No hay servicios
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
