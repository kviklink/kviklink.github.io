// Imports /////////////////////////////////////////////////////////////////////
import Fuse from 'fuse.js'
import { inspect } from 'util'
import { Option, Some, None } from 'ts-results'
import { XbsBuilder } from 'xbs'
import { RaindropBuilder } from 'raindrop'

// Constants ///////////////////////////////////////////////////////////////////
const RD_TOKEN = '...';
const XBS_ID = '...';
const XBS_KEY = '...'

// Main ////////////////////////////////////////////////////////////////////////
async function xbs_main() {
    // Build xbs api client
    const xbsr = await new XbsBuilder()
        .setRawCredentials(XBS_ID, XBS_KEY)
        .finish();

    if (xbsr.err) { console.log(xbsr.val); return }
    const xbs = xbsr.val

    // Get data
    const datar = await xbs.get()
    if (datar.err) { console.log(datar.val); return }
    const data = datar.val

    // Inspect data
    console.log(inspect(data.toXbs(), false, null, true))

    // Try to find folder
    const folder = data.findFolderByTitle('[xbs] Other')
    console.log(folder.unwrap())

    // Upload changes
    // const upload = await xbs.put(data)
    // console.log(inspect(upload, false, null, true))

}

async function main() {
    // Build raindrop api client
    const rdr = new RaindropBuilder()
        .setTestToken(RD_TOKEN)
        .finish();
    if (rdr.err) { console.log(rdr.val); return }
    const rd = rdr.val

    // Post raindrop
    console.log('>>> create raindrop')
    const res = await rd.postRaindrop({
        title: 'Pinshelf Config',
        excerpt: 'Do not modify! Sorting to other collections allowed!',
        note: JSON.stringify({ hello: { world: '!!!' }, test: [1,2,3]}),
        link: 'https://pinshelf.github.io',
        domain: 'pinshelf.github.io',
    })
    if (res.err) { console.log(res.val); return }
    console.log(inspect(res.val, false, null, true))

    const createdRaindrop = res.val

    // Update raindrop
    console.log('\n>>> update raindrop')
    const res2 = await rd.putRaindrop(createdRaindrop.item._id, {
        note: JSON.stringify({ some: 'new', data: { hi: 123, a: ['b', 2]}})
    })
    if (res2.err) { console.log(res2.val); return }
    console.log(inspect(res2.val, false, null, true))

    // Sleep for a second
    // await new Promise(res => setTimeout(res, 1_000))

    // Get data
    console.log('\n>>> get all raindrops')
    const bookmarksr = await rd.getAllRaindrops()
    if (bookmarksr.err) { console.log(bookmarksr.val); return }
    const bookmarks = bookmarksr.val

    console.log('\n>>> find config raindrop')
    console.log(bookmarks.find(b => b.title === 'Pinshelf Config'))

    /////
    console.log('\n>>> user stats')
    const x = (await rd.getUserStats()).unwrap()
    console.log(x)
}

////////////////////////////////////////////////////////////////////////////////
main();
////////////////////////////////////////////////////////////////////////////////
