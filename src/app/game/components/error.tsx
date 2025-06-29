
export default function GameError({
    error
}:{
    error: string
}) {
    return (
        <>
            <div className="flex flex-col items-center justify-center h-screen bg-primary text-secondary">
                <h1 className="text-4xl font-bold mb-4 text-accent">Error</h1>
                <p className="text-lg mb-8">An error occurred while trying to start the game.</p>
                <div className="bg-secondary text-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4">Error Details</h2>
                    <p>{error}</p>
                </div>
            </div>
        </>
    )
}