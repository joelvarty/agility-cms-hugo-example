const jsyaml = require("js-yaml")
const TurndownService = require('turndown')
const fs = require("fs")

require("dotenv").config({
	path: `.env.local`,
})

const { getSyncClient, agilityConfig } = require('./agility.config')


const runSync = async ({ isPreview }) => {

	//sync the agility content
	const agilitySyncClient = getSyncClient({ isPreview })
	await agilitySyncClient.runSync();

	//create the markdown files based on blog posts
	await createMD({ agilityClient: agilitySyncClient.store, isPreview })

}

const clearSync = async ({ isPreview }) => {

	const agilitySyncClient = getSyncClient({ isPreview })
	await agilitySyncClient.clearSync();

}

const createMD = async ({ agilityClient, isPreview }) => {

	//we are going to use the posts list to create blog posts in the content/post folder
	const folder = "content/post"
	const referenceName = "posts"
	const languageCode = agilityConfig.languageCode

	let posts = await agilityClient.getContentList({ referenceName, languageCode });
	let categories = await agilityClient.getContentList({ referenceName: 'categories', languageCode });
	let authors = await agilityClient.getContentList({ referenceName: 'authors', languageCode });

	const turndownService = new TurndownService()

	posts.forEach(async (post) => {

		const categoryID = post.fields.category.contentid;
		const authorID = post.fields.author.contentid;

		const category = categories.find(c => c.contentID == categoryID);
		const author = authors.find(a => a.contentID == authorID);



		let imageSrc = post.fields.image.url
		let slug = post.fields.slug
		try {

			let filepath = `content/posts/${slug}.md`

			let frontMatter =
			{
				title: post.fields.title,
				date: post.fields.date,
				category: category ? category.fields.title : null,
				author: author ? author.fields.name : null,
				draft: isPreview
			}

			const fmStr = jsyaml.safeDump(frontMatter)

			const mdBody = turndownService.turndown(post.fields.content)

			const md = `---\r\n${fmStr}\r\n---\r\n${mdBody}\r\n`

			fs.writeFileSync(filepath, md)


		} catch (e) {
			console.error(e)
		}

	})
}


if (process.argv[2]) {

	if (process.argv[2] === "clear") {
		//clear everything
		return clearSync({ isPreview: true });
		return clearSync({ isPreview: false });
	} else if (process.argv[2] === "sync") {
		//run the sync
		let isPreview = true
		if (process.argv[3] && process.argv[3] === "live") {
			isPreview = false
		}

		return runSync({ isPreview })

	}
}

module.exports = {
	clearSync,
	runSync
}