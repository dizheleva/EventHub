import { toast } from "react-toastify";

export default function useToast() {
    function showToast(type, message) {
        if (!type || !message) return;

        const options = {
            position: "bottom-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
        };

        if (type === "success") {
            toast.success(message, options);
        } else if (type === "error") {
            toast.error(message, options);
        } else if (type === "info") {
            toast.info(message, options);
        } else {
            toast(message, options);
        }
    }

    return { showToast };
}

