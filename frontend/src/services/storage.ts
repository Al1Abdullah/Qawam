const KEYS = {
  USER_ID: 'qawam_user_id',
  USER_NAME: 'qawam_user_name',
  ONBOARDING_DONE: 'qawam_onboarding_done',
};

export const storage = {
  saveUserId: (id: string) => localStorage.setItem(KEYS.USER_ID, id),
  getUserId: () => localStorage.getItem(KEYS.USER_ID),
  
  saveUserName: (name: string) => localStorage.setItem(KEYS.USER_NAME, name),
  getUserName: () => localStorage.getItem(KEYS.USER_NAME),
  
  setOnboardingDone: (done: boolean) => localStorage.setItem(KEYS.ONBOARDING_DONE, JSON.stringify(done)),
  isOnboardingDone: () => {
    const val = localStorage.getItem(KEYS.ONBOARDING_DONE);
    return val ? JSON.parse(val) : false;
  },
  
  clear: () => localStorage.clear(),
};
