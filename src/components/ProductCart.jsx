import { motion } from 'framer-motion';

export default function ProductCart({ product, isSelected, onSelect }) {
    const {
        "ID": id,
        "Model Name": modelName = 'Unnamed Product',
        "Company Name": companyName = 'N/A',
        "Capacity": capacity = '?',
        "Max Price": price = 0,
        image_url
    } = product;

    const imageUrl = image_url || `https://placehold.co/96x96/e0e7ff/4338ca?text=${modelName.charAt(0)}`;

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <motion.div
            variants={cardVariants}
            whileHover={{ scale: 1.03, zIndex: 10 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className={`bg-white shadow-sm hover:shadow-lg flex items-center p-4 rounded-lg cursor-pointer border-2 ${isSelected ? 'border-indigo-500 shadow-md' : 'border-transparent'}`}
            onClick={() => onSelect(id)}
        >
            <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-md flex items-center justify-center mr-4">
                <img src={imageUrl} alt={modelName} className="max-w-full max-h-full object-contain" />
            </div>
            <div className="flex-grow">
                <h3 className="font-semibold text-base text-gray-800">{modelName}</h3>
                <p className="text-sm text-gray-500">{companyName} - {capacity}GB</p>
                <p className="text-lg font-bold text-gray-900 mt-2">₹{price.toLocaleString('en-IN')}</p>
            </div>
        </motion.div>
    );
}