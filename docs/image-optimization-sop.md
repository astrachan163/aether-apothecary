**Part 1: Optimizing Images for the Web with Adobe Photoshop & Bridge**

**Goal:** To create a consistent and efficient workflow for optimizing images that balances quality and file size, tailored for this Next.js e-commerce website.

**Step 1: Create a Photoshop Action for Automation**

An "Action" in Photoshop records a series of edits that you can then apply to other images automatically.

1.  **Open an Image:** Start by opening one of your original, high-resolution product images in Adobe Photoshop.
2.  **Open the Actions Panel:** Go to **Window > Actions**.
3.  **Create a New Action:**
    *   Click the folder icon at the bottom of the Actions panel to create a new "Set." Name it **"E-commerce Website Optimization"**.
    *   With your new set selected, click the **+** icon to create a new action. Name it **"Resize and Save as JPEG & WebP"**.
    *   Click **"Record."** Photoshop will now record your steps.

4.  **Record the Optimization Steps:**

    *   **Resize the Image:**
        *   Go to **Image > Image Size**.
        *   Our product cards display images at a height of 240px (`h-60` in Tailwind CSS). To ensure images look sharp on high-resolution displays (like Retina screens), we'll use a 2x resolution.
        *   Set the **Height** to **480 pixels**. Let the width adjust automatically to maintain the aspect ratio.
        *   Click **OK**.

    *   **Save as JPEG:**
        *   Go to **File > Export > Save for Web (Legacy)**.
        *   **Preset/File Type:** Choose **JPEG**.
        *   **Quality:** Set the quality to **70**. This is a good balance for web photos.
        *   **Metadata:** Set to **None**.
        *   Click **Save...**. Create a new folder on your computer called `optimized-images` and save the file there. **Do not overwrite your original images.**

    *   **Save as WebP:**
        *   Go to **File > Save a Copy...**.
        *   In the "Save as type" dropdown, select **WebP**.
        *   Click **Save**.
        *   A WebP options dialog will appear. You can leave the settings at their defaults (Quality 75) and click **OK**. Save it in the same `optimized-images` folder.

5.  **Stop Recording:**
    *   Go back to the **Actions** panel and click the square **"Stop"** icon. Your action is now saved.

**Step 2: Batch Process with Adobe Bridge**

1.  **Open Bridge:** Launch Adobe Bridge and navigate to the folder with your original, high-resolution images.
2.  **Select Images:** Select all the images you want to optimize.
3.  **Run the Batch Command:**
    *   Go to **Tools > Photoshop > Batch...**.
    *   **Set:** Choose the **"E-commerce Website Optimization"** set.
    *   **Action:** Choose the **"Resize and Save as JPEG & WebP"** action.
    *   **Source:** Should be **"Bridge."**
    *   **Destination:** Select **"Folder"** and choose your `optimized-images` folder.
    *   Click **"OK."** Photoshop will now automatically process all the selected images.

**Step 3: Integrating with Your Next.js Project**

1.  **Move Optimized Images:**
    *   Take the generated JPEG and WebP files from your `optimized-images` folder and move them into the `public/images/products` directory in your project.

2.  **Using the `next/image` Component:**
    *   In your `ProductCard.tsx` component, the `next/image` component is already set up to handle responsive images and will automatically serve the WebP version to browsers that support it.
    *   By pre-sizing the images to 480px in height, we're providing a good base size for `next/image` to work with, preventing it from having to process unnecessarily large files.
