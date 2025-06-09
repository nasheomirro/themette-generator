type CurrentPanelObj = {
	mobile: 'preview' | 'editor' | 'generated' | 'theme';
	desktop: {
		editor: 'editor' | 'theme';
		preview: 'preview' | 'generated';
	};
};

/** determines the current active shell panel for both mobile and desktop */
export const panel = $state<CurrentPanelObj>({
	mobile: 'theme',
	desktop: {
		editor: 'theme',
		preview: 'preview'
	}
});
