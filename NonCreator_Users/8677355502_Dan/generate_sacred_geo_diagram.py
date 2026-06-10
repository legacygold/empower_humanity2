import matplotlib
matplotlib.use('PDF')
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.backends.backend_pdf import PdfPages

R = 1.0
angles = np.linspace(0, 2*np.pi, 7, endpoint=False)

with PdfPages('seed_of_life_connected_rotated.pdf') as pdf:
    fig, ax = plt.subplots(figsize=(8,8))
    # Draw original seed circles
    for ang in angles:
        x, y = R*np.cos(ang), R*np.sin(ang)
        circle = plt.Circle((x, y), R, fill=False, color='black', linewidth=0.8)
        ax.add_patch(circle)
    # Centers
    centers = np.column_stack((R*np.cos(angles), R*np.sin(angles)))
    # Connect all centers (K7)
    for i in range(7):
        for j in range(i+1, 7):
            ax.plot(centers[[i, j], 0], centers[[i, j], 1], color='blue', linewidth=0.5)
    # Rotate by 90 degrees
    theta = np.deg2rad(90)
    R_rot = np.array([[np.cos(theta), -np.sin(theta)], [np.sin(theta), np.cos(theta)]])
    centers_rot = centers @ R_rot.T
    # Draw rotated circles
    for (x, y) in centers_rot:
        circle = plt.Circle((x, y), R, fill=False, color='red', linewidth=0.8, linestyle='--')
        ax.add_patch(circle)
    # Draw rotated lines
    for i in range(7):
        for j in range(i+1, 7):
            ax.plot(centers_rot[[i, j], 0], centers_rot[[i, j], 1], color='green', linewidth=0.5, linestyle=':')
    ax.set_aspect('equal')
    ax.axis('off')
    plt.title('Seed of Life: Connected Centers + 90° Rotation', fontsize=12)
    pdf.savefig(fig)
    plt.close()
    print('PDF saved: seed_of_life_connected_rotated.pdf')