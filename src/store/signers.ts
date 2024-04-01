import { writable } from 'svelte/store';

const signers = writable<Array<{ publicKey: string; weight: number | undefined }>>([]);

function addSigner(): void {
  signers.update((value) => [...value, { publicKey: '', weight: undefined }]);
}

function removeSigner(index: number): void {
  signers.update((value) => value.filter((_, i) => i !== index));
}

export { signers, addSigner, removeSigner };
