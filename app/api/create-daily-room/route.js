export async function POST() {
  try {
    // 🔍 Debug: confirm API key exists
    if (!process.env.DAILY_API_KEY) {
      return Response.json(
        { error: "DAILY_API_KEY is missing" },
        { status: 500 }
      );
    }

    const res = await fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        properties: {
          exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
          start_audio_off: false,
          start_video_off: true,
        },
      }),
    });

    const data = await res.json();

    if (!data.url) {
      return Response.json(
        { error: "Daily room creation failed", data },
        { status: 500 }
      );
    }

    return Response.json({ roomUrl: data.url });
  } catch (err) {
    return Response.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
