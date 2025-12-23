import { HiOutlineTrendingUp, HiOutlineTrendingDown } from 'react-icons/hi';

/**
 * StatsCard Component
 * 
 * Displays a metric with optional trend indicator
 * 
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {string|number} props.value - Main value to display
 * @param {React.ReactNode} props.icon - Icon component
 * @param {number} [props.trend] - Percentage change (positive or negative)
 * @param {string} [props.bgColor] - Background color class
 * @returns {JSX.Element}
 */
export default function StatsCard({ title, value, icon: Icon, trend, bgColor = 'bg-blue-500' }) {
    const isPositive = trend && trend > 0;
    const isNegative = trend && trend < 0;

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-900">{value}</p>

                    {trend !== undefined && (
                        <div className="flex items-center mt-2">
                            {isPositive && (
                                <>
                                    <HiOutlineTrendingUp className="w-4 h-4 text-green-500 mr-1" />
                                    <span className="text-sm text-green-500 font-medium">+{trend}%</span>
                                </>
                            )}
                            {isNegative && (
                                <>
                                    <HiOutlineTrendingDown className="w-4 h-4 text-red-500 mr-1" />
                                    <span className="text-sm text-red-500 font-medium">{trend}%</span>
                                </>
                            )}
                            {!isPositive && !isNegative && (
                                <span className="text-sm text-gray-500 font-medium">0%</span>
                            )}
                            <span className="text-sm text-gray-500 ml-1">vs last month</span>
                        </div>
                    )}
                </div>

                {Icon && (
                    <div className={`${bgColor} p-4 rounded-lg`}>
                        <Icon className="w-8 h-8 text-white" />
                    </div>
                )}
            </div>
        </div>
    );
}
