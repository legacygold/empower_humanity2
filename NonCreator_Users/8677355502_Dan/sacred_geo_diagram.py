#!/usr/bin/env python3
"""
Sacred Geometry-inspired Cellular Automaton Visualization
Hexagonal lattice showing pattern evolution over generations
"""

import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import RegularPolygon
import os

def hex_grid_to_coords(row, col):
    """Convert hexagonal grid coordinates to pixel coordinates"""
    x = col * 1.5
    y = row * np.sqrt(3)/2 + (col % 2) * np.sqrt(3)/4
    return x, y

def draw_hexagon(ax, x, y, size=0.4, color='white', edgecolor='black'):
    """Draw a single hexagon at the given position"""
    hex_patch = RegularPolygon((x, y), numVertices=6, radius=size, 
                             facecolor=color, edgecolor=edgecolor, linewidth=1)
    ax.add_patch(hex_patch)

def create_sacred_geo_diagram():
    """Create and save the sacred geometry cellular automaton diagram"""
    
    # Define the grid size
    rows, cols = 7, 7
    
    # Initialize generations
    generations = [
        # Generation 0
        [[0, 0, 0, 0, 0, 0, 0],
         [0, 0, 1, 0, 0, 0, 0],
         [0, 0, 0, 0, 0, 0, 0],
         [0, 0, 0, 0, 0, 0, 0],
         [0, 0, 0, 0, 0, 0, 0],
         [0, 0, 0, 0, 0, 0, 0],
         [0, 0, 0, 0, 0, 0, 0]],
        
        # Generation 1
        [[0, 0, 0, 0, 0, 0, 0],
         [0, 0, 0, 0, 0, 0, 0],
         [0, 0, 1, 1, 0, 0, 0],
         [0, 0, 0, 0, 0, 0, 0],
         [0, 0, 0, 0, 0, 0, 0],
         [0, 0, 0, 0, 0, 0, 0],
         [0, 0, 0, 0, 0, 0, 0]],
        
        # Generation 2
        [[0, 0, 0, 0, 0, 0, 0],
         [0, 0, 1, 0, 0, 0, 0],
         [0, 0, 0, 0, 0, 0, 0],
         [0, 0, 0, 0, 0, 0, 0],
         [0, 0, 0, 1, 0, 0, 0],
         [0, 0, 0, 0, 0, 0, 0],
         [0, 0, 0, 0, 0, 0, 0]]
    ]
    
    # Create figure
    fig, axes = plt.subplots(1, 3, figsize=(15, 5))
    fig.suptitle('Sacred Geometry Cellular Automaton (Hexagonal Lattice)', fontsize=16, fontweight='bold')
    
    # Draw each generation
    for ax, gen_data, title in zip(axes, generations, ['Generation 0', 'Generation 1', 'Generation 2']):
        ax.set_xlim(-1, cols)
        ax.set_ylim(-1, rows)
        ax.set_aspect('equal')
        ax.set_title(title, fontsize=14, fontweight='bold')
        
        # Draw hexagonal grid
        for row in range(rows):
            for col in range(cols):
                x, y = hex_grid_to_coords(row, col)
                color = 'gold' if gen_data[row][col] == 1 else 'white'
                draw_hexagon(ax, x, y, size=0.4, color=color)
        
        ax.set_xticks([])
        ax.set_yticks([])
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)
        ax.spines['bottom'].set_visible(False)
        ax.spines['left'].set_visible(False)
        
        # Add rule text
        ax.text(0.02, 0.98, 'Rule: Live if\nexactly 2\nneighbors', 
                transform=ax.transAxes, fontsize=10, verticalalignment='top',
                bbox=dict(boxstyle='round', facecolor='lightblue', alpha=0.7))
    
    # Add overall explanation
    plt.figtext(0.5, 0.02, 
                'Sacred Geometry-inspired Cellular Automaton on Hexagonal Lattice\n' +
                'Each cell interacts with 6 neighbors in the Flower-of-Life pattern',
                ha='center', fontsize=12, style='italic')
    
    # Save the diagram
    plt.tight_layout()
    plt.savefig('sacred_geo_diagram.png', dpi=150, bbox_inches='tight')
    plt.close()
    
    return 'sacred_geo_diagram.png'

if __name__ == '__main__':
    # Create the diagram
    output_file = create_sacred_geo_diagram()
    print(f"Diagram saved as: {output_file}")
    print("The image shows the evolution of a cellular automaton on a hexagonal lattice,")
    print("inspired by sacred geometry patterns like the Flower of Life.")