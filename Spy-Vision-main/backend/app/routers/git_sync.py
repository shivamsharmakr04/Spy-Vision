import subprocess
from pathlib import Path
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/git", tags=["git"])

# Resolve the git repository root (contains .git)
REPO_ROOT = Path(__file__).resolve().parents[3]
if not (REPO_ROOT / ".git").exists():
    # Fallback search parent paths
    for parent in Path(__file__).resolve().parents:
        if (parent / ".git").exists():
            REPO_ROOT = parent
            break


class PushRequest(BaseModel):
    message: str | None = None


def run_git_cmd(*args: str) -> tuple[int, str, str]:
    try:
        proc = subprocess.run(
            ["git", *args],
            cwd=REPO_ROOT,
            capture_output=True,
            text=True,
            timeout=30,
        )
        return proc.returncode, proc.stdout.strip(), proc.stderr.strip()
    except Exception as e:
        return 1, "", str(e)


@router.get("/status")
def get_git_status():
    code, branch, _ = run_git_cmd("branch", "--show-current")
    if code != 0 or not branch:
        branch = "main"

    code, remote_url, _ = run_git_cmd("config", "--get", "remote.origin.url")
    if code != 0 or not remote_url:
        remote_url = "https://github.com/shivamsharmakr04/Spy-Vision.git"

    code, status_out, _ = run_git_cmd("status", "--porcelain")
    changed_files = [line.strip() for line in status_out.splitlines() if line.strip()]

    code, log_out, _ = run_git_cmd("log", "-1", "--pretty=format:%h|%an|%ar|%s")
    last_commit = {}
    if code == 0 and log_out:
        parts = log_out.split("|", 3)
        if len(parts) == 4:
            last_commit = {
                "hash": parts[0],
                "author": parts[1],
                "date": parts[2],
                "message": parts[3],
            }

    return {
        "branch": branch,
        "remote_url": remote_url,
        "clean": len(changed_files) == 0,
        "changed_files_count": len(changed_files),
        "changed_files": changed_files[:10],
        "last_commit": last_commit,
    }


@router.post("/push")
def push_git_code(payload: PushRequest):
    # Check if there are changes to commit
    code, status_out, _ = run_git_cmd("status", "--porcelain")
    has_changes = bool(status_out.strip())

    committed = False
    commit_msg = payload.message.strip() if payload.message and payload.message.strip() else "feat: update surveillance console and telemetry"

    if has_changes:
        code, _, err = run_git_cmd("add", "-A")
        if code != 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to stage changes: {err}",
            )

        code, out, err = run_git_cmd("commit", "-m", commit_msg)
        if code != 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to commit changes: {err}",
            )
        committed = True

    # Push to origin
    code, branch, _ = run_git_cmd("branch", "--show-current")
    branch = branch or "main"

    code, push_out, push_err = run_git_cmd("push", "origin", branch)
    if code != 0:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Git push failed: {push_err or push_out}",
        )

    # Get latest commit info
    code, log_out, _ = run_git_cmd("log", "-1", "--pretty=format:%h|%s")
    latest_hash = ""
    latest_msg = ""
    if code == 0 and log_out:
        parts = log_out.split("|", 1)
        latest_hash = parts[0]
        latest_msg = parts[1] if len(parts) > 1 else ""

    return {
        "success": True,
        "committed": committed,
        "branch": branch,
        "commit_hash": latest_hash,
        "message": "Successfully pushed all code to GitHub repository!",
        "details": push_err or push_out or "Repository up to date.",
    }
