/**
 * AI Image Classifier — Frontend Logic
 * =====================================
 * Handles:
 *   - Drag-and-drop & file picker image upload
 *   - Image preview with validation
 *   - Sending images to the /classify backend endpoint
 *   - Rendering animated classification results
 *   - Error handling with retry support
 */

// ─── DOM Elements ───────────────────────────────────────────────
const dropzone        = document.getElementById('dropzone');
const dropzoneContent = document.getElementById('dropzone-content');
const previewContainer= document.getElementById('preview-container');
const previewImg      = document.getElementById('preview-img');
const imgInput        = document.getElementById('imgInput');
const removeBtn       = document.getElementById('remove-btn');
const classifyBtn     = document.getElementById('classify-btn');
const btnText         = classifyBtn.querySelector('.btn-text');
const btnLoader       = classifyBtn.querySelector('.btn-loader');
const resultsSection  = document.getElementById('results-section');
const resultsList     = document.getElementById('results-list');
const resultsSubtitle = document.getElementById('results-subtitle');
const errorSection    = document.getElementById('error-section');
const errorMessage    = document.getElementById('error-message');
const retryBtn        = document.getElementById('retry-btn');

// ─── State ──────────────────────────────────────────────────────
let selectedFile = null;

// ─── Constants ──────────────────────────────────────────────────
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/gif'];

// ─── Drag & Drop ────────────────────────────────────────────────
['dragenter', 'dragover'].forEach(event => {
    dropzone.addEventListener(event, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('drag-over');
    });
});

['dragleave', 'drop'].forEach(event => {
    dropzone.addEventListener(event, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('drag-over');
    });
});

dropzone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

// ─── Click to Browse ────────────────────────────────────────────
dropzone.addEventListener('click', (e) => {
    if (e.target === removeBtn || removeBtn.contains(e.target)) return;
    imgInput.click();
});

imgInput.addEventListener('change', () => {
    if (imgInput.files.length > 0) {
        handleFile(imgInput.files[0]);
    }
});

// ─── Remove Image ───────────────────────────────────────────────
removeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    clearImage();
});

// ─── Classify Button ────────────────────────────────────────────
classifyBtn.addEventListener('click', classifyImage);

// ─── Retry Button ───────────────────────────────────────────────
retryBtn.addEventListener('click', () => {
    errorSection.style.display = 'none';
    if (selectedFile) {
        classifyImage();
    }
});

// ═══════════════════════════════════════════════════════════════
// FILE HANDLING
// ═══════════════════════════════════════════════════════════════

function handleFile(file) {
    // Validate type
    if (!ALLOWED_TYPES.includes(file.type)) {
        showError(`Invalid file type "${file.type}". Please upload a JPG, PNG, or WEBP image.`);
        return;
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
        showError(`File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum size is 10 MB.`);
        return;
    }

    selectedFile = file;

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImg.src = e.target.result;
        dropzoneContent.style.display = 'none';
        previewContainer.style.display = 'block';
        // Re-trigger animation
        previewContainer.style.animation = 'none';
        previewContainer.offsetHeight; // force reflow
        previewContainer.style.animation = '';
    };
    reader.readAsDataURL(file);

    // Enable button
    classifyBtn.disabled = false;

    // Hide previous results/errors
    resultsSection.style.display = 'none';
    errorSection.style.display = 'none';
}

function clearImage() {
    selectedFile = null;
    imgInput.value = '';
    previewContainer.style.display = 'none';
    dropzoneContent.style.display = 'block';
    classifyBtn.disabled = true;
    resultsSection.style.display = 'none';
    errorSection.style.display = 'none';
}

// ═══════════════════════════════════════════════════════════════
// CLASSIFICATION
// ═══════════════════════════════════════════════════════════════

async function classifyImage() {
    if (!selectedFile) return;

    // Show loading state
    setLoading(true);
    resultsSection.style.display = 'none';
    errorSection.style.display = 'none';

    try {
        // Read image as ArrayBuffer
        const buffer = await selectedFile.arrayBuffer();

        // Send to backend
        const response = await fetch('/classify', {
            method: 'POST',
            body: buffer,
            headers: {
                'Content-Type': 'application/octet-stream'
            }
        });

        let data;
        try {
            data = await response.json();
        } catch(e) {
            // If the server returns HTML instead of JSON (e.g., 500 error)
            showError(`Server error (${response.status}). Please try again.`);
            setLoading(false);
            return;
        }

        if (!response.ok) {
            // Handle API errors
            if (data.loading) {
                showError('The AI model is warming up. Please wait 10-20 seconds and try again.');
            } else {
                showError(data.error || `Server error (${response.status}). Please try again.`);
            }
            return;
        }

        // Check if response is an array of predictions
        if (Array.isArray(data) && data.length > 0) {
            renderResults(data);
        } else if (data.error) {
            showError(data.error);
        } else {
            showError('Unexpected response from the AI model. Please try again.');
        }
    } catch (err) {
        console.error('Classification error:', err);
        showError('Could not connect to the server. Make sure the backend is running.');
    } finally {
        setLoading(false);
    }
}

// ═══════════════════════════════════════════════════════════════
// RESULTS RENDERING
// ═══════════════════════════════════════════════════════════════

function renderResults(predictions) {
    resultsList.innerHTML = '';

    // Take top 5 results
    const top = predictions.slice(0, 5);

    // Update subtitle
    const topLabel = top[0].label.replace(/_/g, ' ');
    const topScore = (top[0].score * 100).toFixed(1);
    resultsSubtitle.textContent = `Top prediction: ${topLabel} (${topScore}%)`;

    top.forEach((pred, index) => {
        const pct = (pred.score * 100).toFixed(1);
        const label = pred.label.replace(/_/g, ' ');
        const rankClass = index < 3 ? `rank-${index + 1}` : 'rank-other';

        const item = document.createElement('div');
        item.className = 'result-item';
        item.style.animationDelay = `${index * 0.08}s`;

        item.innerHTML = `
            <div class="result-rank ${rankClass}">#${index + 1}</div>
            <div class="result-info">
                <div class="result-label">${label}</div>
                <div class="result-bar-track">
                    <div class="result-bar-fill" data-width="${pct}"></div>
                </div>
            </div>
            <div class="result-score">${pct}%</div>
        `;

        resultsList.appendChild(item);
    });

    // Show results section
    resultsSection.style.display = 'block';
    resultsSection.style.animation = 'none';
    resultsSection.offsetHeight;
    resultsSection.style.animation = '';

    // Animate bars after a brief delay
    requestAnimationFrame(() => {
        setTimeout(() => {
            document.querySelectorAll('.result-bar-fill').forEach(bar => {
                bar.style.width = bar.dataset.width + '%';
            });
        }, 200);
    });

    // Scroll results into view
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ═══════════════════════════════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════════════════════════════

function showError(message) {
    errorMessage.textContent = message;
    errorSection.style.display = 'block';
    errorSection.style.animation = 'none';
    errorSection.offsetHeight;
    errorSection.style.animation = '';
    errorSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ═══════════════════════════════════════════════════════════════
// UI HELPERS
// ═══════════════════════════════════════════════════════════════

function setLoading(isLoading) {
    classifyBtn.disabled = isLoading;
    btnText.style.display = isLoading ? 'none' : 'inline-flex';
    btnLoader.style.display = isLoading ? 'inline-flex' : 'none';
}
