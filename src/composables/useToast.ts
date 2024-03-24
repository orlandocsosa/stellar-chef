import { toast } from '@zerodevx/svelte-toast';

const themes = {
  success: {
    '--toastColor': 'mintcream',
    '--toastBackground': 'rgba(72,187,120,0.9)',
    '--toastBarBackground': '#2F855A'
  },
  danger: {
    '--toastColor': 'white',
    '--toastBackground': 'rgba(255, 126, 126, 0.9)',
    '--toastBarBackground': 'rgba(255,0,0,0.9)'
  }
};

type ShowToastFunction = (message: string, theme: keyof typeof themes) => void;

function useToast(): { showToast: ShowToastFunction } {
  function showToast(message: string, theme: keyof typeof themes): void {
    toast.push(message, { theme: themes[theme] });
  }

  return { showToast };
}

export default useToast;
