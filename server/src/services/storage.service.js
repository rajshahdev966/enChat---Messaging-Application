import ImageKit, { toFile } from '@imagekit/nodejs';
import { env } from '../config/env.js';




const client = new ImageKit({
    privateKey: env.IMAGEKIT_PRIVATE_KEY,
});


export const generatePrivateImageUrl = (filePath)=> {
    return client.helper.buildSrc({
        urlEndpoint: "",
        src: filePath,
        signed: true,
        expiresIn:600
    })
}


export const uploadFiles = async ({ buffer, fileName }) => {
    const response = await client.files.upload({
        file: await toFile(buffer),
        fileName,
        folder: "enChat_dev",
        isPrivateFile: true,
        useUniqueFileName: true,
    });

    console.log("URL OF RESPONSE OF FILE URL ==>", response)

    return { fileId: response.fileId, url: response.url }
}

export const deleteFile = (fileId) => client.files.delete(fileId)

export const deleteFileByUrl = async (url) => {
    if (!url) return
    const filename = decodeURIComponent(new URL(url).pathname.split("/").pop() || "")
    if (!filename) return

    const matches = await client.files.list({
        path: "/enChat_dev",
        searchQuery: filename,
        limit: 100,
    })
    const file = matches.find((item) => item.url === url)
    if (file) return deleteFile(file.fileId)
}
