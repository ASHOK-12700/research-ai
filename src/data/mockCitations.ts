import type { Citation } from '../types';

export const mockCitations: Citation[] = [
  {
    id: 'cit-1',
    paperId: 'paper-1',
    paperTitle: 'Deep Residual Learning for Image Recognition',
    authors: ['He, K.', 'Zhang, X.', 'Ren, S.', 'Sun, J.'],
    year: 2016,
    journal: 'Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition (CVPR)',
    volume: '2016',
    pages: '770-778',
    doi: '10.1109/CVPR.2016.90',
    bibtex: `@inproceedings{he2016deep,
  title={Deep residual learning for image recognition},
  author={He, Kaiming and Zhang, Xiangyu and Ren, Shaoqing and Sun, Jian},
  booktitle={Proceedings of the IEEE conference on computer vision and pattern recognition},
  pages={770--778},
  year={2016},
  doi={10.1109/CVPR.2016.90}
}`
  },
  {
    id: 'cit-2',
    paperId: 'paper-2',
    paperTitle: 'An Attention-Free Swin Transformer for Medical Image Segmentation',
    authors: ['Rostova, E.', 'Thorne, M.', 'Al-Mansoor, A.', 'Chen, D.'],
    year: 2024,
    journal: 'Medical Image Analysis',
    volume: '92',
    pages: '103045',
    doi: '10.1016/j.media.2024.103045',
    bibtex: `@article{rostova2024attention,
  title={An Attention-Free Swin Transformer for Medical Image Segmentation},
  author={Rostova, Elena and Thorne, Marcus and Al-Mansoor, Amina and Chen, David},
  journal={Medical Image Analysis},
  volume={92},
  pages={103045},
  year={2024},
  publisher={Elsevier},
  doi={10.1016/j.media.2024.103045}
}`
  },
  {
    id: 'cit-3',
    paperId: 'paper-3',
    paperTitle: 'MobileNetV4: Ultra-Efficient Neural Networks for Edge Devices',
    authors: ['Howard, A.', 'Sandler, M.', 'Chu, G.', 'Jacob, B.'],
    year: 2024,
    journal: 'IEEE International Conference on Robotics and Automation (ICRA)',
    pages: '1410-1417',
    doi: '10.1109/ICRA.2024.98021',
    bibtex: `@inproceedings{howard2024mobilenetv4,
  title={MobileNetV4: Ultra-Efficient Neural Networks for Edge Devices},
  author={Howard, Andrew and Sandler, Mark and Chu, Grace and Jacob, Benoit},
  booktitle={IEEE International Conference on Robotics and Automation (ICRA)},
  pages={1410--1417},
  year={2024},
  doi={10.1109/ICRA.2024.98021}
}`
  },
  {
    id: 'cit-4',
    paperId: 'paper-4',
    paperTitle: 'Evaluating LLM-Generated Feedback in Automated Essay Scoring',
    authors: ['Jenkins, S.', 'Vance, R.', 'Li, N.', 'Al-Hassan, T.'],
    year: 2025,
    journal: 'Computers & Education',
    volume: '208',
    pages: '104920',
    doi: '10.1016/j.compedu.2025.104920',
    bibtex: `@article{jenkins2025evaluating,
  title={Evaluating LLM-Generated Feedback in Automated Essay Scoring},
  author={Jenkins, Sarah and Vance, Robert and Li, Na and Al-Hassan, Tariq},
  journal={Computers \& Education},
  volume={208},
  pages={104920},
  year={2025},
  publisher={Elsevier},
  doi={10.1016/j.compedu.2025.104920}
}`
  }
];
