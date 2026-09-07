<!-- SVG Background Partial -->
<div class="bg-svg-container <?php echo $current_page ?? ''; ?>-bg">
    <svg width="100%" height="100%" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <g class="topo-group">
            <!-- Several paths to create the topographic look -->
            <path class="topo-line ring-gold" style="animation-delay: 0.1s;" d="M-100,200 Q150,150 400,300 T900,100 T1200,400" />
            <path class="topo-line ring-amber" style="animation-delay: 0.3s;" d="M-100,400 Q200,350 450,500 T950,300 T1250,600" />
            <path class="topo-line ring-pale" style="animation-delay: 0.5s;" d="M-100,600 Q250,550 500,700 T1000,500 T1300,800" />
            <path class="topo-line ring-gold" style="animation-delay: 0.7s;" d="M-100,800 Q300,750 550,900 T1050,700 T1350,1000" />
            
            <!-- More varied lines -->
            <path class="topo-line ring-amber" style="animation-delay: 0.2s;" d="M200,-100 Q300,150 500,100 T800,400 T1100,200" />
            <path class="topo-line ring-pale" style="animation-delay: 0.4s;" d="M400,-100 Q500,250 700,200 T1000,500 T1300,300" />
            
            <!-- Circular-ish island line -->
            <path class="topo-line ring-gold" style="animation-delay: 0.9s;" d="M300,800 C400,700 600,700 700,800 C800,900 600,1100 400,1000 Z" />
        </g>
    </svg>
</div>

<style>
    /* Specific page background placements */
    .dashboard-bg .topo-group {
        transform: rotate(-5deg) scale(1.1);
    }
    
    .maintenance_projects-bg .topo-group {
        transform: rotate(-25deg) scale(1.4) translate(-100px, 50px);
    }
</style>
