#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
 * ================================================================================
 * MULTI-AI FILE PASTER CHROME EXTENSION | PRODUCTION RELEASE v1.1.0
 * CHROME EXTENSION SOFTWARE - HOSTWEK CUSTOM LICENSE
 * ================================================================================
 *
 * MODULE: mcp-servers/tools/base.py
 * FUNCTION: Base class for all MCP tools with common functionality
 * ARCHITECTURE: Abstract base class with shared utilities
 * SECURITY: Local processing only, no data transmission, privacy-first design
 * PERFORMANCE: Optimized file operations, efficient caching
 * COMPATIBILITY: Python 3.8+, async/await patterns
 *
 * COPYRIGHT © 2025 HOSTWEK LTD. ALL RIGHTS RESERVED.
 * DEVELOPED BY JOSEPH MATINO UNDER WEKTURBO DESIGNS - HOSTWEK LTD
 * LICENSED UNDER HOSTWEK CUSTOM LICENSE
 * ================================================================================
 """

import os
import json
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from mcp.types import Tool


class BaseTool(ABC):
    """Base class for all MCP tools."""
    
    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
        self.project_root = os.getcwd()
    
    @abstractmethod
    def get_definition(self) -> Tool:
        """Return the tool definition for MCP."""
        pass
    
    @abstractmethod
    async def execute(self, arguments: Dict[str, Any]) -> str:
        """Execute the tool with given arguments."""
        pass
    
    def read_file(self, path: str) -> Optional[str]:
        """Read a file safely."""
        try:
            full_path = os.path.join(self.project_root, path)
            with open(full_path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception:
            return None
    
    def read_json(self, path: str) -> Optional[Dict[str, Any]]:
        """Read a JSON file safely."""
        try:
            content = self.read_file(path)
            if content:
                return json.loads(content)
        except Exception:
            pass
        return None
    
    def list_files(self, directory: str, extension: str = None) -> List[str]:
        """List files in a directory with optional extension filter."""
        files: List[str] = []
        try:
            dir_path = os.path.join(self.project_root, directory)
            for root, _, filenames in os.walk(dir_path):
                for filename in filenames:
                    if extension is None or filename.endswith(extension):
                        rel_path = os.path.relpath(os.path.join(root, filename), self.project_root)
                        files.append(rel_path.replace('\\', '/'))
        except Exception:
            pass
        return files
    
    def format_result(self, title: str, sections: List[Dict[str, Any]]) -> str:
        """Format tool output consistently."""
        lines = [
            "=" * 80,
            f"🔧 {title}",
            "=" * 80,
            ""
        ]
        
        for section in sections:
            section_title = section.get('title', '')
            section_content = section.get('content', [])
            section_status = section.get('status', '')
            
            if section_title:
                status_icon = "✅" if section_status == "success" else "❌" if section_status == "error" else "ℹ️"
                lines.append(f"{status_icon} {section_title}")
                lines.append("-" * 80)
            
            if isinstance(section_content, list):
                for item in section_content:
                    lines.append(f"  • {item}")
            elif isinstance(section_content, str):
                lines.append(f"  {section_content}")
            
            lines.append("")
        
        return "\n".join(lines)

