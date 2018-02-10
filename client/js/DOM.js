export function getCheckedRadio(radio_group) {
    for (let i = 0; i < radio_group.length; i++){
        const button = radio_group[i];
        if (button.checked) {
            return button;
        }
    };
    return undefined;
}