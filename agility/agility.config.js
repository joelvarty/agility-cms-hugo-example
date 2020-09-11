
const agilityContentSync = require('@agility/content-sync')
const agilityFileSystem = require("@agility/content-sync/src/store-interface-filesystem")

const agilityConfig = {
	guid: process.env.AGILITY_GUID, //Set your guid here
	fetchAPIKey: process.env.AGILITY_API_FETCH_KEY, //Set your fetch apikey here
	previewAPIKey: process.env.AGILITY_API_PREVIEW_KEY, //set your preview apikey
	languageCode: 'en-us', //the language for your website in Agility CMS
	channelName: 'website', //the name of your channel in Agility CMS
}

const getSyncClient = ({ isPreview }) => {

	let cachePath = `agility/.cache/${isPreview ? 'preview' : 'live'}`

	console.log('cache path = ' + cachePath)
	const apiKey = isPreview ? agilityConfig.previewAPIKey : agilityConfig.fetchAPIKey

	return agilityContentSync.getSyncClient({
		guid: agilityConfig.guid,
		apiKey: apiKey,
		isPreview: isPreview,
		languages: [agilityConfig.languageCode],
		channels: [agilityConfig.channelName],
		store: {
			interface: agilityFileSystem,
			options: {
				rootPath: cachePath
			}
		}
	})
}


module.exports = {
	agilityConfig,
	getSyncClient
}
