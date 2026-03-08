#!/usr/bin/env python3
"""
QUIZZZZ Complete Upload Script
Runs both content and questions upload scripts
"""

import subprocess
import sys
import os

def run_script(script_name):
    """Run a Python script and return success status"""
    try:
        print(f"\n🔄 Running {script_name}...")
        result = subprocess.run([sys.executable, script_name],
                              cwd=os.path.dirname(os.path.abspath(__file__)),
                              capture_output=False,
                              text=True)

        return result.returncode == 0
    except Exception as e:
        print(f"❌ Error running {script_name}: {str(e)}")
        return False

def main():
    print("🚀 QUIZZZZ Complete Upload Script")
    print("=" * 50)
    print("This will upload ALL data: subjects, topics, subtopics, and questions")
    print("=" * 50)

    # Run scripts in dependency order
    scripts = [
        ("upload_subjects.py", "subjects"),
        ("upload_topics.py", "topics"),
        ("upload_subtopics.py", "subtopics"),
        ("upload_questions.py", "questions")
    ]

    results = {}
    for script_name, data_type in scripts:
        success = run_script(script_name)
        results[data_type] = success

    print("\n" + "=" * 50)
    print("📊 COMPLETE UPLOAD SUMMARY")
    print("=" * 50)

    all_success = all(results.values())

    if all_success:
        print("🎉 ALL UPLOADS COMPLETED SUCCESSFULLY!")
    else:
        print("⚠️  SOME UPLOADS FAILED OR WERE SKIPPED:")

    for data_type, success in results.items():
        status = "✅ SUCCESS" if success else "❌ FAILED"
        print(f"   {data_type.capitalize()}: {status}")

    if not all_success:
        print("\n🔍 Check the error messages above for details")
        print("💡 Tip: Run individual scripts to isolate issues")

if __name__ == "__main__":
    main()
