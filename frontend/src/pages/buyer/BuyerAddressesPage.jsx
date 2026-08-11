import AddressManager from '../../components/common/AddressManager';
import { FiMapPin } from 'react-icons/fi';

const BuyerAddressesPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FiMapPin size={22} className="text-purple-500" /> My Addresses
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add and manage your delivery addresses</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
        <AddressManager />
      </div>
    </div>
  );
};

export default BuyerAddressesPage;
