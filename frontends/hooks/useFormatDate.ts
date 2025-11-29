export const useFormatDate = () => {
    const format = (value?: Date | string) => {
        if (!value) return "—";
        const d = new Date(value);
        return d.toLocaleDateString("vi-VN");
    };
    return { format };
};
