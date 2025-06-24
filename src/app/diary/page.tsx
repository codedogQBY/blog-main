export default function DiaryPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
            <div className="pt-16">
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">文章页面</h1>
                        <p className="text-lg text-gray-600 dark:text-gray-300">
                            这是文章页面，注意看Header中"文章"导航项的选中状态
                        </p>
                    </div>
                </main>
            </div>
        </div>
    )
}

