module.exports = {
	moduleFileExtensions: [
		'js',
		'ts',
		'svelte'
		// 'vue'
	],
	transform: {
		'^.+\\.ts$': 'ts-jest',
		'^.+\\.svelte$': [
			'svelte-jester',
			{
				preprocess: true
			}
		]
	}
};
