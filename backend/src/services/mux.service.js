const muxClient = require('../config/mux');

exports.createUploadUrl = async () => {
  const upload = await muxClient.video.uploads.create({
    cors_origin: process.env.FRONTEND_URL,
    new_asset_settings: { playback_policy: ['public'] },
  });
  return { uploadUrl: upload.url, uploadId: upload.id };
};

exports.getAsset = async (assetId) => {
  return muxClient.video.assets.retrieve(assetId);
};

exports.deleteAsset = async (assetId) => {
  return muxClient.video.assets.delete(assetId);
};