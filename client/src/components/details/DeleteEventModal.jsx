import { Trash2 } from "lucide-react";
import Modal from "../common/Modal";

export default function DeleteEventModal({ isOpen, onClose, eventTitle, onConfirm }) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Изтриване на събитие">
            <div className="space-y-6">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <Trash2 className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Сигурни ли сте?
                        </h3>
                        <p className="text-gray-700">
                            Искате ли да изтриете събитието <strong>"{eventTitle}"</strong>? 
                            Това действие не може да бъде отменено.
                        </p>
                    </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
                    >
                        Отказ
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-6 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Изтрий
                    </button>
                </div>
            </div>
        </Modal>
    );
}

