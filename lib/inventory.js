module.exports = class InventoryManager {
    constructor(client) {
        this.inventory = [];
        this.heldItemSlot = 0;
        this.selectedItem;

        client.on('held_item_slot', data => {
            this.heldItemSlot = data.slotId;
            this.selectedItem = this.getHotbarSlot(this.heldItemSlot);
        });

        client.on('set_creative_slot', data => {
            this.setSlot(data.slot, data.item.itemId);
            this.selectedItem = this.getHotbarSlot(this.heldItemSlot);
        });
    }

    setSlot(slot, itemId) {
        this.inventory[slot] = itemId;
    }

    getSlot(slot) {
        return this.inventory[slot];
    }

    getHotbarSlot(slot) {
        return this.inventory[slot+36];
    }
}