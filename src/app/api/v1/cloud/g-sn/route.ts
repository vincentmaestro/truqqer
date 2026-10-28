import { verifyToken } from "@/lib/helpers";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
    try{
        const { token, folder } = await request.json();

        const validToken = verifyToken(
            token.value,
            process.env.PHONE_VERIFICATION_SECRET!
        );
        if(!validToken.success)
            return Response.json({ error: 'Provide a token to complete this request.' }, { status: 403 });

        const timestamp = Math.round(new Date().getTime() / 1000);
        const signature = cloudinary.utils.api_sign_request({
            timestamp,
            folder
        }, process.env.CLOUDINARY_SECRET!);

        return Response.json({
            signature,
            timestamp,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY,
        });
    }
    catch(err) {
        return Response.json({
            error: err instanceof Error
            ? err.message
            : 'Failed to generate signature.'
        },
        { status: 500 });
    }
}
