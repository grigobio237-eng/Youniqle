export default function handler(req, res) {
    res.status(200).json({
        uniqueId: "UNIQUE_ID_" + Date.now(),
        message: "This is a NEW version of the API. If you see this, HMR is working."
    });
}
