import PyInstaller.__main__
import os
import shutil

# ─── Configuration ───────────────────────────────────────────────
APP_NAME = "AI_Image_Classifier"
ENTRY_POINT = "app.py"
STATIC_DIR = "static"

def build():
    print(f"🚀 Starting build for {APP_NAME}...")

    # Define PyInstaller arguments
    # --onefile: Bundle into a single executable
    # --add-data: Include the static folder (format: source;destination for Windows)
    # --name: Name of the resulting .exe
    # --clean: Clean cache before build
    args = [
        ENTRY_POINT,
        '--onefile',
        f'--add-data={STATIC_DIR}{os.pathsep}{STATIC_DIR}',
        f'--name={APP_NAME}',
        '--clean',
        '--noconfirm',
        '--windowed' # Optional: hides console, but maybe keep for debugging
    ]

    # Run PyInstaller
    PyInstaller.__main__.run(args)

    print(f"\n✅ Build complete! You can find the executable in the 'dist' folder.")

if __name__ == "__main__":
    build()
